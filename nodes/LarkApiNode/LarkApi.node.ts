import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { getTenantAccessToken, TokenServiceError } from '../../services/tokenService';
import { LarkBaseService } from '../../services/LarkBaseService';
import { WikiService } from '../../services/WikiService';

export class LarkApi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Lark API',
		name: 'larkApi',
		icon: {
			light: 'file:../../icons/lark.svg',
			dark: 'file:../../icons/lark.svg',
		},
		group: ['transform'],
		version: 1,
		description: 'Obtain tenant access tokens or call Base and Wiki APIs for Lark (Feishu)',
		defaults: {
			name: 'Lark API',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Group',
				name: 'group',
				type: 'options',
				default: 'authenticate',
				options: [
					{
						name: 'Authenticate',
						value: 'authenticate',
						description: 'Actions related to generating Lark tenant tokens',
					},
					{
						name: 'Wiki',
						value: 'wiki',
						description: 'Actions for Lark Wiki space/node APIs',
					},
					{
						name: 'Base',
						value: 'base',
						description: 'Actions for Lark Base Apps (Bitable)',
					},
				],
			},
			{
				displayName: 'Action',
				name: 'authenticateAction',
				type: 'options',
				options: [
					{
						name: 'Get Access Token',
						value: 'getAccessToken',
						description: 'Request a tenant access token using app credentials',
					},
				],
				default: 'getAccessToken',
				displayOptions: {
					show: {
						group: ['authenticate'],
					},
				},
			},
			{
				displayName: 'Action',
				name: 'wikiAction',
				type: 'options',
				options: [
					{
						name: 'Create Node',
						value: 'createNode',
						description: 'Create a new wiki node inside a space',
					},
					{
						name: 'Get Node Info',
						value: 'getNodeInfo',
						description: 'Retrieve information about a wiki node by token',
					},
					{
						name: 'List Child Nodes',
						value: 'listChildNodes',
						description: 'List child nodes within a wiki space',
					},
				],
				default: 'createNode',
				displayOptions: {
					show: {
						group: ['wiki'],
					},
				},
			},
			{
				displayName: 'Action',
				name: 'baseAction',
				type: 'options',
				options: [
					{
						name: 'Batch Create Records',
						value: 'batchCreateRecords',
						description: 'Create multiple records in a Base table',
					},
					{
						name: 'Batch Create Table',
						value: 'batchCreateTable',
						description: 'Create multiple tables in a Base App with one request',
					},
					{
						name: 'Batch Delete Records',
						value: 'batchDeleteRecords',
						description: 'Delete multiple records from a Base table',
					},
					{
						name: 'Batch Delete Table',
						value: 'batchDeleteTable',
						description: 'Delete multiple tables from a Base App',
					},
					{
						name: 'Batch Get Records',
						value: 'batchGetRecords',
						description: 'Retrieve multiple records from a Base table by ID',
					},
					{
						name: 'Batch Update Records',
						value: 'batchUpdateRecords',
						description: 'Update multiple records in a Base table',
					},
					{
						name: 'Copy App',
						value: 'copyApp',
						description: 'Copy an existing Base App',
					},
					{
						name: 'Create App',
						value: 'createApp',
						description: 'Create a new Base App',
					},
					{
						name: 'Create Record',
						value: 'createRecord',
						description: 'Create a record inside a Base table',
					},
					{
						name: 'Create Table',
						value: 'createTable',
						description: 'Create a new table inside a Base App',
					},
					{
						name: 'Delete Record',
						value: 'deleteRecord',
						description: 'Delete a record from a Base table',
					},
					{
						name: 'Delete Table',
						value: 'deleteTable',
						description: 'Delete a table from a Base App',
					},
					{
						name: 'Get App Info',
						value: 'getApp',
						description: 'Retrieve metadata for a Base App',
					},
					{
						name: 'List Tables',
						value: 'listTables',
						description: 'List all tables inside a Base App',
					},
					{
						name: 'Search Records',
						value: 'searchRecords',
						description: 'Search records within a Base table',
					},
					{
						name: 'Update App Name',
						value: 'updateAppName',
						description: 'Rename a Base App and optionally toggle advanced mode',
					},
					{
						name: 'Update Record',
						value: 'updateRecord',
						description: 'Update a record in a Base table',
					},
					{
						name: 'Update Table',
						value: 'updateTable',
						description: 'Rename a table inside a Base App',
					},
				],
				default: 'createApp',
				displayOptions: {
					show: {
						group: ['base'],
					},
				},
			},
			{
				displayName: 'App ID',
				name: 'app_id',
				type: 'string',
				required: true,
				default: '',
				description: 'The Lark application App ID',
				displayOptions: {
					show: {
						group: ['authenticate'],
					},
				},
			},
			{
				displayName: 'App Secret',
				name: 'app_secret',
				type: 'string',
				required: true,
				typeOptions: {
					password: true,
				},
				default: '',
				description: 'The Lark application App Secret used to request tenant access tokens',
				displayOptions: {
					show: {
						group: ['authenticate'],
					},
				},
			},
			{
				displayName: 'Tenant Access Token',
				name: 'tenant_access_token',
				type: 'string',
				required: true,
				typeOptions: {
					password: true,
				},
				default: '',
				description:
					'The tenant access token returned by the Authenticate action (Get Access Token)',
				displayOptions: {
					show: {
						group: ['wiki', 'base'],
					},
				},
			},
			{
				displayName: 'Space ID',
				name: 'wiki_space_id',
				type: 'string',
				required: true,
				default: '',
				description: 'Wiki space identifier',
				displayOptions: {
					show: {
						group: ['wiki'],
						wikiAction: ['createNode', 'listChildNodes'],
					},
				},
			},
			{
				displayName: 'App Token',
				name: 'base_app_token',
				type: 'string',
				required: true,
				default: '',
				description: 'Token of the Base App to operate on',
				displayOptions: {
					show: {
						group: ['base'],
						baseAction: [
							'batchCreateRecords',
							'batchCreateTable',
							'batchDeleteRecords',
							'batchDeleteTable',
							'batchGetRecords',
							'batchUpdateRecords',
							'copyApp',
							'createRecord',
							'createTable',
							'deleteRecord',
							'deleteTable',
							'getApp',
							'listTables',
							'searchRecords',
							'updateAppName',
							'updateRecord',
							'updateTable',
						],
					},
				},
			},
			{
				displayName: 'App Name',
				name: 'base_app_name',
				type: 'string',
				required: true,
				default: '',
				description: 'Name for the Base App being created, copied, or updated',
				displayOptions: {
					show: {
						group: ['base'],
						baseAction: ['createApp', 'copyApp', 'updateAppName'],
					},
				},
			},
			{
				displayName: 'Folder Token',
				name: 'base_app_folder_token',
				type: 'string',
				default: '',
				description: 'Optional folder token to place the new or copied Base App into',
				displayOptions: {
					show: {
						group: ['base'],
						baseAction: ['createApp', 'copyApp'],
					},
				},
			},
			{
				displayName: 'Without Content',
				name: 'base_app_without_content',
				type: 'boolean',
				default: false,
				description: 'Whether to exclude the source Base content when copying',
				displayOptions: {
					show: {
						group: ['base'],
						baseAction: ['copyApp'],
					},
				},
			},
			{
				displayName: 'Is Advanced',
				name: 'base_app_is_advanced',
				type: 'boolean',
				default: false,
				description: 'Toggle whether the Base App should be marked as advanced',
				displayOptions: {
					show: {
						group: ['base'],
						baseAction: ['updateAppName'],
					},
				},
			},
			{
				displayName: 'Table Definition (JSON)',
				name: 'base_table_definition',
				type: 'json',
				default: '{}',
				description: 'JSON body describing the table to create',
				displayOptions: {
					show: {
						group: ['base'],
						baseAction: ['createTable'],
					},
				},
			},
			{
				displayName: 'Batch Table Payload (JSON)',
				name: 'base_table_batch_definition',
				type: 'json',
				default: '{}',
				description: 'JSON payload accepted by the batch create tables endpoint',
				displayOptions: {
					show: {
						group: ['base'],
						baseAction: ['batchCreateTable'],
					},
				},
			},
			{
				displayName: 'Table ID',
				name: 'base_table_id',
				type: 'string',
				required: true,
				default: '',
				description: 'Identifier for the table inside the Base App',
				displayOptions: {
					show: {
						group: ['base'],
						baseAction: [
							'updateTable',
							'deleteTable',
							'createRecord',
							'updateRecord',
							'searchRecords',
							'deleteRecord',
							'batchCreateRecords',
							'batchUpdateRecords',
							'batchGetRecords',
							'batchDeleteRecords',
						],
					},
				},
			},
			{
				displayName: 'Record ID',
				name: 'base_record_id',
				type: 'string',
				required: true,
				default: '',
				description: 'Identifier of the record inside the table',
				displayOptions: {
					show: {
						group: ['base'],
						baseAction: ['updateRecord', 'deleteRecord'],
					},
				},
			},
			{
				displayName: 'Record Payload (JSON)',
				name: 'base_record_payload',
				type: 'json',
				default: '{}',
				description: 'JSON body sent when creating or updating a single record',
				displayOptions: {
					show: {
						group: ['base'],
						baseAction: ['createRecord', 'updateRecord'],
					},
				},
			},
			{
				displayName: 'Record Search Query (JSON)',
				name: 'base_record_search_payload',
				type: 'json',
				default: '{}',
				description: 'JSON body passed to the record search endpoint',
				displayOptions: {
					show: {
						group: ['base'],
						baseAction: ['searchRecords'],
					},
				},
			},
			{
				displayName: 'Record Page Size',
				name: 'base_record_page_size',
				type: 'number',
				default: 100,
				description: 'Maximum number of records to return per page (max 500)',
				typeOptions: {
					minValue: 1,
					maxValue: 500,
				},
				displayOptions: {
					show: {
						group: ['base'],
						baseAction: ['searchRecords'],
					},
				},
			},
			{
				displayName: 'Record Page Token',
				name: 'base_record_page_token',
				type: 'string',
				default: '',
				description: 'Pagination token returned by a previous record search',
				displayOptions: {
					show: {
						group: ['base'],
						baseAction: ['searchRecords'],
					},
				},
			},
			{
				displayName: 'Record Batch Payload (JSON)',
				name: 'base_record_batch_payload',
				type: 'json',
				default: '{}',
				description: 'JSON body for batch create or batch update record endpoints',
				displayOptions: {
					show: {
						group: ['base'],
						baseAction: ['batchCreateRecords', 'batchUpdateRecords'],
					},
				},
			},
			{
				displayName: 'Record IDs (JSON Array)',
				name: 'base_record_batch_get_ids',
				type: 'json',
				default: '[]',
				description: 'Array of record IDs to fetch in batch',
				displayOptions: {
					show: {
						group: ['base'],
						baseAction: ['batchGetRecords'],
					},
				},
			},
			{
				displayName: 'User ID Type',
				name: 'base_record_user_id_type',
				type: 'string',
				default: '',
				description: 'Optional user ID type for batch get records',
				displayOptions: {
					show: {
						group: ['base'],
						baseAction: ['batchGetRecords'],
					},
				},
			},
			{
				displayName: 'With Shared URL',
				name: 'base_record_with_shared_url',
				type: 'boolean',
				default: false,
				description: 'Whether to include the shared URL when batch getting records',
				displayOptions: {
					show: {
						group: ['base'],
						baseAction: ['batchGetRecords'],
					},
				},
			},
			{
				displayName: 'Automatic Fields',
				name: 'base_record_automatic_fields',
				type: 'boolean',
				default: false,
				description: 'Whether to expand automatic fields when batch getting records',
				displayOptions: {
					show: {
						group: ['base'],
						baseAction: ['batchGetRecords'],
					},
				},
			},
			{
				displayName: 'Records (JSON Array)',
				name: 'base_record_batch_delete_ids',
				type: 'json',
				default: '[]',
				description: 'Array of record IDs to delete',
				displayOptions: {
					show: {
						group: ['base'],
						baseAction: ['batchDeleteRecords'],
					},
				},
			},
			{
				displayName: 'Table Name',
				name: 'base_table_name',
				type: 'string',
				required: true,
				default: '',
				description: 'New table name to apply during update',
				displayOptions: {
					show: {
						group: ['base'],
						baseAction: ['updateTable'],
					},
				},
			},
			{
				displayName: 'Page Size',
				name: 'base_table_page_size',
				type: 'number',
				default: 100,
				description: 'Maximum number of tables to return (max 100)',
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				displayOptions: {
					show: {
						group: ['base'],
						baseAction: ['listTables'],
					},
				},
			},
			{
				displayName: 'Page Token',
				name: 'base_table_page_token',
				type: 'string',
				default: '',
				description: 'Pagination token from the previous list tables response',
				displayOptions: {
					show: {
						group: ['base'],
						baseAction: ['listTables'],
					},
				},
			},
			{
				displayName: 'Table IDs (JSON Array)',
				name: 'base_table_batch_delete_ids',
				type: 'json',
				default: '[]',
				description: 'Array of table IDs to delete',
				displayOptions: {
					show: {
						group: ['base'],
						baseAction: ['batchDeleteTable'],
					},
				},
			},
			{
				displayName: 'Node Payload (JSON)',
				name: 'wiki_node_payload',
				type: 'json',
				default: '{}',
				description: 'Payload for the wiki node creation request',
				displayOptions: {
					show: {
						group: ['wiki'],
						wikiAction: ['createNode'],
					},
				},
			},
			{
				displayName: 'Node Token',
				name: 'wiki_node_token',
				type: 'string',
				required: true,
				default: '',
				description: 'Wiki node token',
				displayOptions: {
					show: {
						group: ['wiki'],
						wikiAction: ['getNodeInfo'],
					},
				},
			},
			{
				displayName: 'Parent Node Token',
				name: 'wiki_parent_node_token',
				type: 'string',
				default: '',
				description: 'Optional parent node token to scope the listing',
				displayOptions: {
					show: {
						group: ['wiki'],
						wikiAction: ['listChildNodes'],
					},
				},
			},
			{
				displayName: 'Page Size',
				name: 'wiki_page_size',
				type: 'number',
				default: 50,
				description: 'Maximum number of nodes to return (max 50)',
				typeOptions: {
					minValue: 1,
					maxValue: 50,
				},
				displayOptions: {
					show: {
						group: ['wiki'],
						wikiAction: ['listChildNodes'],
					},
				},
			},
			{
				displayName: 'Page Token',
				name: 'wiki_page_token',
				type: 'string',
				default: '',
				description: 'Pagination token from the previous list response',
				displayOptions: {
					show: {
						group: ['wiki'],
						wikiAction: ['listChildNodes'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const runCount = items.length > 0 ? items.length : 1;
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < runCount; itemIndex++) {
			const group = this.getNodeParameter('group', itemIndex) as string;

			switch (group) {
				case 'authenticate': {
					const action = this.getNodeParameter('authenticateAction', itemIndex) as string;

					switch (action) {
						case 'getAccessToken': {
							const appId = this.getNodeParameter('app_id', itemIndex) as string;
							const appSecret = this.getNodeParameter('app_secret', itemIndex) as string;

							let tokenResponse;
							try {
								tokenResponse = await getTenantAccessToken({
									appId,
									appSecret,
								});
							} catch (error) {
								if (error instanceof TokenServiceError) {
									throw new NodeOperationError(this.getNode(), error.message);
								}

								throw error;
							}

							returnData.push({
								json: { ...(tokenResponse.data as IDataObject) },
							});

							break;
						}
						default:
							throw new NodeOperationError(
								this.getNode(),
								`Unsupported action (${action}) for group ${group}`,
							);
					}

					break;
				}
				case 'wiki': {
					const action = this.getNodeParameter('wikiAction', itemIndex) as string;
					const tenantAccessToken = this.getNodeParameter(
						'tenant_access_token',
						itemIndex,
					) as string;

					const wikiService = new WikiService({ tenantAccessToken });
					let responsePayload: IDataObject;

					switch (action) {
						case 'createNode': {
							const spaceId = this.getNodeParameter('wiki_space_id', itemIndex) as string;
							const payload = this.getNodeParameter('wiki_node_payload', itemIndex, {}) as IDataObject;
							responsePayload = await wikiService.createNode(spaceId, payload);
							break;
						}
						case 'getNodeInfo': {
							const nodeToken = this.getNodeParameter('wiki_node_token', itemIndex) as string;
							responsePayload = await wikiService.getNodeInfo(nodeToken);
							break;
						}
						case 'listChildNodes': {
							const spaceId = this.getNodeParameter('wiki_space_id', itemIndex) as string;
							const parentNodeToken = this.getNodeParameter(
								'wiki_parent_node_token',
								itemIndex,
							) as string;
							const pageSize = this.getNodeParameter('wiki_page_size', itemIndex) as number;
							const pageToken = this.getNodeParameter('wiki_page_token', itemIndex) as string;

							const query: Record<string, number | string> = {};

							if (parentNodeToken) {
								query.parent_node_token = parentNodeToken;
							}

							if (pageSize) {
								query.page_size = pageSize;
							}

							if (pageToken) {
								query.page_token = pageToken;
							}

							responsePayload = await wikiService.listChildNodes(spaceId, query);
							break;
						}
						default:
							throw new NodeOperationError(
								this.getNode(),
								`Unsupported action (${action}) for group ${group}`,
							);
					}

					returnData.push({
						json: responsePayload,
					});

					break;
				}
				case 'base': {
					const action = this.getNodeParameter('baseAction', itemIndex) as string;
					const tenantAccessToken = this.getNodeParameter(
						'tenant_access_token',
						itemIndex,
					) as string;

					const baseService = new LarkBaseService({ tenantAccessToken });
					let responsePayload: IDataObject;

					switch (action) {
						case 'createApp': {
							const name = this.getNodeParameter('base_app_name', itemIndex) as string;
							const folderToken = this.getNodeParameter(
								'base_app_folder_token',
								itemIndex,
								'',
							) as string;

							responsePayload = await baseService.createApp({
								name,
								folder_token: folderToken || undefined,
							});
							break;
						}
						case 'copyApp': {
							const appToken = this.getNodeParameter('base_app_token', itemIndex) as string;
							const name = this.getNodeParameter('base_app_name', itemIndex) as string;
							const folderToken = this.getNodeParameter(
								'base_app_folder_token',
								itemIndex,
								'',
							) as string;
							const withoutContent = this.getNodeParameter(
								'base_app_without_content',
								itemIndex,
							) as boolean;

							responsePayload = await baseService.copyApp({
								app_token: appToken,
								name,
								folder_token: folderToken || undefined,
								without_content: withoutContent,
							});
							break;
						}
						case 'getApp': {
							const appToken = this.getNodeParameter('base_app_token', itemIndex) as string;
							responsePayload = await baseService.getApp(appToken);
							break;
						}
						case 'updateAppName': {
							const appToken = this.getNodeParameter('base_app_token', itemIndex) as string;
							const name = this.getNodeParameter('base_app_name', itemIndex) as string;
							const isAdvanced = this.getNodeParameter(
								'base_app_is_advanced',
								itemIndex,
							) as boolean;

							responsePayload = await baseService.updateAppName({
								app_token: appToken,
								name,
								is_advanced: isAdvanced,
							});
							break;
						}
						case 'createTable': {
							const appToken = this.getNodeParameter('base_app_token', itemIndex) as string;
							const tableDefinition = this.getNodeParameter(
								'base_table_definition',
								itemIndex,
								{},
							) as IDataObject;

							responsePayload = await baseService.createTable(appToken, tableDefinition);
							break;
						}
						case 'batchCreateTable': {
							const appToken = this.getNodeParameter('base_app_token', itemIndex) as string;
							const payload = this.getNodeParameter(
								'base_table_batch_definition',
								itemIndex,
								{},
							) as IDataObject;

							responsePayload = await baseService.batchCreateTable(appToken, payload);
							break;
						}
						case 'updateTable': {
							const appToken = this.getNodeParameter('base_app_token', itemIndex) as string;
							const tableId = this.getNodeParameter('base_table_id', itemIndex) as string;
							const tableName = this.getNodeParameter('base_table_name', itemIndex) as string;

							responsePayload = await baseService.updateTableName(appToken, tableId, tableName);
							break;
						}
						case 'listTables': {
							const appToken = this.getNodeParameter('base_app_token', itemIndex) as string;
							const pageSize = this.getNodeParameter('base_table_page_size', itemIndex) as number;
							const pageToken = this.getNodeParameter('base_table_page_token', itemIndex) as string;

							responsePayload = await baseService.listTables({
								app_token: appToken,
								page_size: pageSize,
								page_token: pageToken || undefined,
							});
							break;
						}
						case 'deleteTable': {
							const appToken = this.getNodeParameter('base_app_token', itemIndex) as string;
							const tableId = this.getNodeParameter('base_table_id', itemIndex) as string;
							responsePayload = await baseService.deleteTable(appToken, tableId);
							break;
						}
						case 'batchDeleteTable': {
							const appToken = this.getNodeParameter('base_app_token', itemIndex) as string;
							const rawTableIds = this.getNodeParameter(
								'base_table_batch_delete_ids',
								itemIndex,
								[],
							) as unknown;

							if (!Array.isArray(rawTableIds)) {
								throw new NodeOperationError(
									this.getNode(),
									'Table IDs must be provided as a JSON array.',
								);
							}

							const tableIds = (rawTableIds as unknown[]).map((value) => {
								if (typeof value === 'string') {
									return value;
								}

								if (value === null || typeof value === 'undefined') {
									return '';
								}

								return String(value);
							});

							responsePayload = await baseService.batchDeleteTables(appToken, tableIds);
							break;
						}
						case 'createRecord': {
							const appToken = this.getNodeParameter('base_app_token', itemIndex) as string;
							const tableId = this.getNodeParameter('base_table_id', itemIndex) as string;
							const payload = this.getNodeParameter('base_record_payload', itemIndex, {}) as IDataObject;
							responsePayload = await baseService.createRecord(appToken, tableId, payload);
							break;
						}
						case 'updateRecord': {
							const appToken = this.getNodeParameter('base_app_token', itemIndex) as string;
							const tableId = this.getNodeParameter('base_table_id', itemIndex) as string;
							const recordId = this.getNodeParameter('base_record_id', itemIndex) as string;
							const payload = this.getNodeParameter('base_record_payload', itemIndex, {}) as IDataObject;
							responsePayload = await baseService.updateRecord(appToken, tableId, recordId, payload);
							break;
						}
						case 'searchRecords': {
							const appToken = this.getNodeParameter('base_app_token', itemIndex) as string;
							const tableId = this.getNodeParameter('base_table_id', itemIndex) as string;
							const payload = this.getNodeParameter(
								'base_record_search_payload',
								itemIndex,
								{},
							) as IDataObject;
							const pageSize = this.getNodeParameter('base_record_page_size', itemIndex) as number;
							const pageToken = this.getNodeParameter('base_record_page_token', itemIndex) as string;

							responsePayload = await baseService.searchRecords({
								app_token: appToken,
								table_id: tableId,
								query: payload,
								page_size: pageSize,
								page_token: pageToken || undefined,
							});
							break;
						}
						case 'deleteRecord': {
							const appToken = this.getNodeParameter('base_app_token', itemIndex) as string;
							const tableId = this.getNodeParameter('base_table_id', itemIndex) as string;
							const recordId = this.getNodeParameter('base_record_id', itemIndex) as string;
							responsePayload = await baseService.deleteRecord(appToken, tableId, recordId);
							break;
						}
						case 'batchCreateRecords': {
							const appToken = this.getNodeParameter('base_app_token', itemIndex) as string;
							const tableId = this.getNodeParameter('base_table_id', itemIndex) as string;
							const payload = this.getNodeParameter(
								'base_record_batch_payload',
								itemIndex,
								{},
							) as IDataObject;
							responsePayload = await baseService.batchCreateRecords(appToken, tableId, payload);
							break;
						}
						case 'batchUpdateRecords': {
							const appToken = this.getNodeParameter('base_app_token', itemIndex) as string;
							const tableId = this.getNodeParameter('base_table_id', itemIndex) as string;
							const payload = this.getNodeParameter(
								'base_record_batch_payload',
								itemIndex,
								{},
							) as IDataObject;
							responsePayload = await baseService.batchUpdateRecords(appToken, tableId, payload);
							break;
						}
						case 'batchGetRecords': {
							const appToken = this.getNodeParameter('base_app_token', itemIndex) as string;
							const tableId = this.getNodeParameter('base_table_id', itemIndex) as string;
							const rawRecordIds = this.getNodeParameter(
								'base_record_batch_get_ids',
								itemIndex,
								[],
							) as unknown;
							const userIdType = this.getNodeParameter(
								'base_record_user_id_type',
								itemIndex,
								'',
							) as string;
							const withSharedUrl = this.getNodeParameter(
								'base_record_with_shared_url',
								itemIndex,
							) as boolean;
							const automaticFields = this.getNodeParameter(
								'base_record_automatic_fields',
								itemIndex,
							) as boolean;

							if (!Array.isArray(rawRecordIds)) {
								throw new NodeOperationError(
									this.getNode(),
									'Record IDs must be provided as a JSON array.',
								);
							}

							const recordIds = (rawRecordIds as unknown[]).map((value) => {
								if (typeof value === 'string') {
									return value;
								}

								if (value === null || typeof value === 'undefined') {
									return '';
								}

								return String(value);
							});

							responsePayload = await baseService.batchGetRecords({
								app_token: appToken,
								table_id: tableId,
								record_ids: recordIds,
								user_id_type: userIdType || undefined,
								with_shared_url: withSharedUrl,
								automatic_fields: automaticFields,
							});
							break;
						}
						case 'batchDeleteRecords': {
							const appToken = this.getNodeParameter('base_app_token', itemIndex) as string;
							const tableId = this.getNodeParameter('base_table_id', itemIndex) as string;
							const rawRecords = this.getNodeParameter(
								'base_record_batch_delete_ids',
								itemIndex,
								[],
							) as unknown;

							if (!Array.isArray(rawRecords)) {
								throw new NodeOperationError(
									this.getNode(),
									'Records must be provided as a JSON array.',
								);
							}

							const recordIds = (rawRecords as unknown[]).map((value) => {
								if (typeof value === 'string') {
									return value;
								}

								if (value === null || typeof value === 'undefined') {
									return '';
								}

								return String(value);
							});

							responsePayload = await baseService.batchDeleteRecords(
								appToken,
								tableId,
								recordIds,
							);
							break;
						}
						default:
							throw new NodeOperationError(
								this.getNode(),
								`Unsupported action (${action}) for group ${group}`,
							);
					}

					returnData.push({
						json: responsePayload,
					});

					break;
				}
				default:
					throw new NodeOperationError(this.getNode(), `Unsupported group: ${group}`);
			}
		}

		return [returnData];
	}
}
