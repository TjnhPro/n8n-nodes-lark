import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { getTenantAccessToken, TokenServiceError } from '../../services/tokenService';
import { WikiService } from '../../services/WikiService';

export class LarkApi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Lark API',
		name: 'larkApi',
		icon: 'file:lark.svg',
		group: ['transform'],
		version: 1,
		description: 'Obtain tenant access tokens or call Wiki APIs for Lark (Feishu)',
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
						group: ['wiki'],
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
				default:
					throw new NodeOperationError(this.getNode(), `Unsupported group: ${group}`);
			}
		}

		return [returnData];
	}
}
