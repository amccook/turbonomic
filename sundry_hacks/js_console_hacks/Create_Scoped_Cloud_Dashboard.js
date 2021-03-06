/*
 * Creates a useful dashboard for cloud entities.
 * The dashboard contains the cloud cost comparison chart, pending actions chart, investements donut, savings donut, and cumulative savings chart.
 * The widgets are formatted and placed on the dashboard in a nice way.
 * 
 * USAGE:
 * 	CreateScopedCloudDashboard(scope_type, scope_name, dashboard_name)
 *  where
 *  	scope_type is "Group" or "Account" or "BillingFamily"
 *  	scope_name is the exact, unique, name for the cloud resources group or account or billing family you want the dashboard to be scoped to.
 *  	dashboard_name is the name you want to give the dashboard
 *  
 *  E.g.
 * 	CreateScopedCloudDashboard("Group", "Preprod AWS Accounts Group", "Preprod AWS Account Dashboard")
 *  This will create a dashboard named "Preprod AWS Account Dashboard" that is scoped to the elements in the group named "Preprod AWS Accounts Group"
 *  
 *  CreateScopedCloudDashboard("Account", "AWS Dev", "AWS Dev Dashboard")
 *  This will create a dashboard named "AWS Dev Dashboard" that is scoped to the account, "AWS Dev."
 * 
 *  CreateScopedCloudDashboard("BillingFamily", "EA Azure", "EA Azure Dashboard")
 *  This will create a dashboard named "EA Azure Dashboard" that is scoped to the billing family, "EA Azure"
 * 
 */


/*
 * Print usage info when the snippet is run/loaded.
 */
console.log("")
console.log("**** USAGE: CreateScopedCloudDashboard(\"Group\", \"GROUP NAME\" ,\"DASHBOARD NAME\")")
console.log("**** USAGE: CreateScopedCloudDashboard(\"Account\", \"ACCOUNT NAME\" ,\"DASHBOARD NAME\")")
console.log("**** USAGE: CreateScopedCloudDashboard(\"BillingFamily\", \"BILLING FAMILY NAME\" ,\"DASHBOARD NAME\")")
console.log("")


async function CreateScopedCloudDashboard(scope_type, scope_name, dashboard_name) {
	if ((scope_type == null) || (scope_type == "")) {
		console.log("**** Need to pass scope type - i.e. \"Group\" or \"Account\" or \"BillingFamily\"")
		console.log("**** USAGE: CreateScopedCloudDashboard(\"Group\"|\"Account\"|\"BillingFamily\", \"GROUP OR ACCOUNT or BILLING FAMILY NAME\" ,\"DASHBOARD NAME\")")
		return
	}
	if ((scope_name == null) || (scope_name == "")) {
		console.log("**** Need to pass name for group to be used for the scope of the dashboard.")
		console.log("**** USAGE: CreateScopedCloudDashboard(\"Group\"|\"Account\"|\"BillingFamily\", \"GROUP OR ACCOUNT or BILLING FAMILY NAME\" ,\"DASHBOARD NAME\")")
		return
	}
	if ((dashboard_name == null) || (dashboard_name == "")) {
		console.log("**** Need to pass name for dashboard to be created.")
		console.log("**** USAGE: CreateScopedCloudDashboard(\"Group\"|\"Account\"|\"BillingFamily\", \"GROUP OR ACCOUNT or BILLING FAMILY NAME\" ,\"DASHBOARD NAME\")")
		return
	}
	
	console.log("Building dashboard, "+dashboard_name+", scoped to "+scope_type+", "+scope_name+" ...")
	
	scope_info = await getUuid(scope_type, scope_name)
	
	/* Create the dashboard */
	dashboard_body = buildDashBody(scope_info, dashboard_name)
	
	response = await fetch('/vmturbo/rest/widgetsets', {
		method: 'POST',
		body: JSON.stringify(dashboard_body),
		headers: {
			'Content-Type': 'application/json'
		}
	})
	
	jsonResponse = await response.json()
	
	
	if (jsonResponse.hasOwnProperty("type")) {
		/* If the response has a "type" field at the top level of the json structure, that field contains the http error code (e.g. 400, 504) and there will be an 
		 * exception field with whatever message the server returned. 
		 * Of course, if the correct response has a type field at the top of the json structure, then more logic is needed to look at the type field and act accordingly. */
		console.log("ERROR: "+jsonResponse.exception)
	} else {
		console.log("Dashboard, "+dashboard_name+", was created.")
	}
}


/*
 * Builds the dashboard API body with the widgets we want for the given scope.
 */
function buildDashBody(scope_info, dashboard_name) {

	scope_uuid = scope_info["uuid"]
	scope_name = scope_info["name"]
	/* Build the API body */
	dashboard_body = {
	    "displayName": dashboard_name, 
	    "scope": "Market",
	    "widgets": [
	     {
	      "displayName": "COST_SAVED_BY_ACTIONS_WIDGET_TITLE",
	      "type": "costSavedByActions",
	      "scope": {
	        "uuid": scope_uuid,
	        "displayName": scope_name,
	        "className": "RefGroup",
	      },
	      "row": 11,
	      "column": 6,
	      "sizeRows": 9,
	      "sizeColumns": 6,
	      "startPeriod": null,
	      "endPeriod": null,
	      "widgetElements": [
	        {
	          "row": 0,
	          "column": 0,
	          "type": "CHART",
	          "properties": {
	            "displayParamName": "COST_SAVED_BY_ACTIONS_WIDGET_TITLE",
	            "overrideScope": true,
	            "show": true,
	            "chartType": "Text and Area Chart",
	            "widgetScopeEnvironmentType": "CLOUD",
	            "directive": "cost-saved-by-actions-chart"
	          }
	        }
	      ]
	    },
	    {
	        "displayName": "PENDING_ACTIONS",
	        "type": "pendingActions",
	        "scope": {
	          "uuid": scope_uuid,
	          "displayName": scope_name,
	          "className": "RefGroup",
	        },
	        "row": 0,
	        "column": 10,
	        "sizeRows": 11,
	        "sizeColumns": 2,
	        "widgetElements": [
	          {
	            "row": 0,
	            "column": 1,
	            "type": "SUMMARY",
	            "properties": {
	              "displayParamName": "PENDING_ACTIONS",
	              "overrideScope": "true",
	              "show": "true",
	              "chartType": "TEXT",
	              "widgetScopeEnvironmentType": "CLOUD",
	              "directive": "pending-actions-summary"
	            },
	          }
	        ]
	      },
	      {
	        "displayName": "WIDGET.POTENTIAL_SAVING_OR_INVESTMENT.NAME",
	        "type": "potentialSavingOrInvestment",
	        "scope": {
	          "uuid": scope_uuid,
	          "displayName": scope_name,
	          "className": "RefGroup",
	        },
	        "row": 11,
	        "column": 3,
	        "sizeRows": 9,
	        "sizeColumns": 3,
	        "widgetElements": [
	          {
	            "row": 0,
	            "column": 0,
	            "type": "CHART",
	            "properties": {
	              "displayParamName": "POTENTIAL_SAVING_OR_INVESTMENT_ENUMS.INVESTMENTS",
	              "overrideScope": "true",
	              "show": "true",
	              "chartType": "Ring Chart",
	              "widgetScopeEnvironmentType": "CLOUD",
	              "directive": "potential-saving-or-investment-chart"
	            },
	          }
	        ]
	      },
	      {
	        "displayName": "WIDGET.POTENTIAL_SAVING_OR_INVESTMENT.NAME",
	        "type": "potentialSavingOrInvestment",
	        "scope": {
	          "uuid": scope_uuid,
	          "displayName": scope_name,
	          "className": "RefGroup",
	        },
	        "row": 11,
	        "column": 0,
	        "sizeRows": 9,
	        "sizeColumns": 3,
	        "widgetElements": [
	          {
	            "row": 0,
	            "column": 0,
	            "type": "CHART",
	            "properties": {
	              "displayParamName": "POTENTIAL_SAVING_OR_INVESTMENT_ENUMS.SAVINGS",
	              "overrideScope": "true",
	              "show": "true",
	              "chartType": "Ring Chart",
	              "widgetScopeEnvironmentType": "CLOUD",
	              "directive": "potential-saving-or-investment-chart"
	            },
	          }
	        ]
	      },
	      {
	        "displayName": "RESOURCE_COMPARISON_SUMMARY_BY_COST",
	        "type": "resourceComparison",
	        "scope": {
	          "uuid": scope_uuid,
	          "displayName": scope_name,
	          "className": "RefGroup",
	        },
	        "row": 0,
	        "column": 0,
	        "sizeRows": 11,
	        "sizeColumns": 10,
	        "widgetElements": [
	          {
	            "row": 0,
	            "column": 1,
	            "type": "CHART",
	            "properties": {
	              "displayParamName": "RESOURCE_COMPARISON_SUMMARY_BY_COST",
	              "overrideScope": "true",
	              "show": "true",
	              "chartType": "Tabular",
	              "widgetScopeEnvironmentType": "CLOUD",
	              "directive": "resource-comparison-chart"
	            },
	          }
	        ]
	      }
	    ],
	    "category": "CUSTOM",
	    "isSharedWithAllUsers": true
	}
	
	return dashboard_body
}


/* Returns UUID for named entity of given type */
async function getUuid(entity_type, entity_name) {
	if (entity_type == "BusApp") {
		filterType = "busAppsByName"
		className = "BusinessApplication"
	} else if (entity_type == "Group") {
		filterType = "groupsByName"
		className = "Group"
	} else if (entity_type == "Account") {
		filterType = "businessAccountByName"
		className = "BusinessAccount"
	} else if (entity_type == "BillingFamily") {
		filterType = "billingFamilyByName"
		className = "BillingFamily"
	} else {
		console.log("getUuid: Called with incorrect entity_type")
		return 0
	}

	entity_name = regExpEscape(entity_name)

	search_body = {
			"criteriaList": [
				{
					"expType": "RXEQ",
					"expVal": "^"+entity_name+"$",  /* need to limit to exact name match only so anchor the name */
					"filterType": filterType,
					"caseSensitive": true 
				}
				],
				"logicalOperator": "AND",
				"className": className,
				"scope": null
	}
	response = await fetch('/vmturbo/rest/search', {
		method: 'POST',
		body: JSON.stringify(search_body),
	    headers: {
	        'Content-Type': 'application/json'
	      }
	})
	info =  await response.json()
	
	if (info.length > 0) {
		/* Found an existing entity so return uuid */
		return {
			"uuid":info[0].uuid,
			"name":info[0].displayName
		}
	}
}

function regExpEscape(literal_string) {
    return literal_string.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');
}

