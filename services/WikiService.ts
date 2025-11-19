import type { IDataObject } from 'n8n-workflow';

import { BaseService, type BaseServiceConfig } from './BaseService';

const CREATE_NODE_ENDPOINT = '/open-apis/wiki/v2/spaces/:space_id/nodes';
const LIST_CHILD_NODES_ENDPOINT = '/open-apis/wiki/v2/spaces/:space_id/nodes';
const GET_NODE_ENDPOINT = '/open-apis/wiki/v2/spaces/get_node';

export interface ListChildNodesQuery {
	page_size?: number;
	page_token?: string;
	parent_node_token?: string;
}

export class WikiService extends BaseService {
	constructor(config: BaseServiceConfig) {
		super(config);
	}

	async createNode(spaceId: string, payload: IDataObject): Promise<IDataObject> {
		if (!spaceId || spaceId.trim() === '') {
			throw new Error('spaceId is required to create a Wiki node.');
		}

		const endpoint = CREATE_NODE_ENDPOINT.replace(
			':space_id',
			encodeURIComponent(spaceId.trim()),
		);

		const response = await this.post<IDataObject>(endpoint, payload);
		return response.data;
	}

	async getNodeInfo(nodeToken: string): Promise<IDataObject> {
		if (!nodeToken || nodeToken.trim() === '') {
			throw new Error('nodeToken is required to retrieve Wiki node information.');
		}

		const response = await this.get<IDataObject>(GET_NODE_ENDPOINT, {
			token: nodeToken.trim(),
		});

		return response.data;
	}

	async listChildNodes(
		spaceId: string,
		query: ListChildNodesQuery = {},
	): Promise<IDataObject> {
		if (!spaceId || spaceId.trim() === '') {
			throw new Error('spaceId is required to list Wiki child nodes.');
		}

		const endpoint = LIST_CHILD_NODES_ENDPOINT.replace(
			':space_id',
			encodeURIComponent(spaceId.trim()),
		);

		const response = await this.get<IDataObject>(endpoint, query as IDataObject);
		return response.data;
	}
}
