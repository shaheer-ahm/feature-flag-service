"""
Feature Flag Service — Lambda handler
"""

import json
import os
import boto3
from datetime import datetime, timezone

# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------

TABLE_NAME = os.environ.get("TABLE_NAME", "feature-flags")
REGION     = os.environ.get("AWS_REGION", "ap-southeast-2")

dynamodb = boto3.resource("dynamodb", region_name=REGION)
table    = dynamodb.Table(TABLE_NAME)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def response(status_code: int, body: dict) -> dict:
    """Build a Lambda proxy response that API Gateway understands."""
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",   # tighten in production
        },
        "body": json.dumps(body),
    }


def now_iso() -> str:
    """Return the current UTC time as an ISO 8601 string."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def flag_pk(name: str) -> str:
    return f"FLAG#{name}"


# ---------------------------------------------------------------------------
# Handler
# ---------------------------------------------------------------------------

def lambda_handler(event, context):
    """
    API Gateway passes the HTTP method and path here.
    Route to the right function and return its result.
    """
    method = event.get("httpMethod", "")
    path   = event.get("path", "")
    params = event.get("pathParameters") or {}

    # ---- Route ----
    if method == "GET" and path == "/flags":
        return get_flags()

    if method == "POST" and path == "/flags":
        body = json.loads(event.get("body") or "{}")
        return create_flag(body)

    if method == "PUT" and "/flags/" in path:
        flag_name = params.get("flagName", "")
        body      = json.loads(event.get("body") or "{}")
        return toggle_flag(flag_name, body)

    if method == "DELETE" and "/flags/" in path:
        flag_name = params.get("flagName", "")
        return delete_flag(flag_name)

    return response(404, {"error": "Route not found"})


# ---------------------------------------------------------------------------
# Endpoint implementations
# ---------------------------------------------------------------------------

def get_flags():
    """
    GET /flags
    Scan the table and return all flag metadata items.
    """
    result = table.scan(
        FilterExpression="SK = :meta",
        ExpressionAttributeValues={":meta": "#METADATA"},
    )

    flags = [
        {
            "flagName":  item["flagName"],
            "enabled":   item["enabled"],
            "createdAt": item["createdAt"],
            "updatedAt": item["updatedAt"],
        }
        for item in result.get("Items", [])
    ]

    return response(200, {"flags": flags})


def create_flag(body: dict):
    """
    POST /flags
    Body: { "flagName": "my-feature", "enabled": false }
    """
    flag_name = body.get("flagName", "").strip()
    if not flag_name:
        return response(400, {"error": "flagName is required"})

    timestamp = now_iso()
    item = {
        "PK":        flag_pk(flag_name),
        "SK":        "#METADATA",
        "flagName":  flag_name,
        "enabled":   body.get("enabled", False),
        "createdAt": timestamp,
        "updatedAt": timestamp,
    }

    # condition_expression prevents accidental overwrites
    try:
        table.put_item(
            Item=item,
            ConditionExpression="attribute_not_exists(PK)",
        )
    except dynamodb.meta.client.exceptions.ConditionalCheckFailedException:
        return response(409, {"error": f"Flag '{flag_name}' already exists"})

    return response(201, {"flag": item})


def toggle_flag(flag_name: str, body: dict):
    """
    PUT /flags/{flagName}
    Body: { "enabled": true }
    """
    if not flag_name:
        return response(400, {"error": "flagName path parameter is required"})

    enabled = body.get("enabled")
    if not isinstance(enabled, bool):
        return response(400, {"error": "'enabled' must be a boolean"})

    timestamp = now_iso()

    try:
        result = table.update_item(
            Key={"PK": flag_pk(flag_name), "SK": "#METADATA"},
            UpdateExpression="SET enabled = :e, updatedAt = :u",
            ConditionExpression="attribute_exists(PK)",
            ExpressionAttributeValues={":e": enabled, ":u": timestamp},
            ReturnValues="ALL_NEW",
        )
    except dynamodb.meta.client.exceptions.ConditionalCheckFailedException:
        return response(404, {"error": f"Flag '{flag_name}' not found"})

    # Write audit entry
    table.put_item(
        Item={
            "PK":        flag_pk(flag_name),
            "SK":        f"AUDIT#{timestamp}",
            "changedAt": timestamp,
            "newValue":  enabled,
            "source":    "admin-dashboard",
        }
    )

    updated = result["Attributes"]
    return response(200, {
        "flag": {
            "flagName":  updated["flagName"],
            "enabled":   updated["enabled"],
            "updatedAt": updated["updatedAt"],
        }
    })


def delete_flag(flag_name: str):
    """
    DELETE /flags/{flagName}
    """
    if not flag_name:
        return response(400, {"error": "flagName path parameter is required"})

    try:
        table.delete_item(
            Key={"PK": flag_pk(flag_name), "SK": "#METADATA"},
            ConditionExpression="attribute_exists(PK)",
        )
    except dynamodb.meta.client.exceptions.ConditionalCheckFailedException:
        return response(404, {"error": f"Flag '{flag_name}' not found"})

    return response(200, {"message": f"Flag '{flag_name}' deleted"})
