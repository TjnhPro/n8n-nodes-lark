import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { getTenantAccessToken, TokenServiceError } from '../../services/tokenService';

export class LarkApi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Lark API',
		name: 'larkApi',
		icon: 'file:lark.svg',
		group: ['transform'],
		version: 1,
		description: 'Obtain tenant access tokens for the Lark (Feishu) API',
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
				],
			},
			{
				displayName: 'Action',
				name: 'action',
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
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const runCount = items.length > 0 ? items.length : 1;
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < runCount; itemIndex++) {
			const group = this.getNodeParameter('group', itemIndex) as string;
			const action = this.getNodeParameter('action', itemIndex) as string;

			if (group !== 'authenticate') {
				throw new NodeOperationError(this.getNode(), `Unsupported group: ${group}`);
			}

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
				default: {
					throw new NodeOperationError(
						this.getNode(),
						`Unsupported action (${action}) for group ${group}`,
					);
				}
			}
		}

		return [returnData];
	}
}
