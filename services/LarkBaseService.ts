import type { IDataObject } from 'n8n-workflow';

import { BaseService, type BaseServiceConfig } from './BaseService';

const CREATE_APP_ENDPOINT = '/open-apis/bitable/v1/apps';
const COPY_APP_ENDPOINT = '/open-apis/bitable/v1/apps/:app_token/copy';
const APP_INFO_ENDPOINT = '/open-apis/bitable/v1/apps/:app_token';
const CREATE_TABLE_ENDPOINT = '/open-apis/bitable/v1/apps/:app_token/tables';
const BATCH_CREATE_TABLE_ENDPOINT = '/open-apis/bitable/v1/apps/:app_token/tables/batch_create';
const TABLE_ITEM_ENDPOINT = '/open-apis/bitable/v1/apps/:app_token/tables/:table_id';
const BATCH_DELETE_TABLE_ENDPOINT = '/open-apis/bitable/v1/apps/:app_token/tables/batch_delete';
const TABLE_RECORDS_ENDPOINT = '/open-apis/bitable/v1/apps/:app_token/tables/:table_id/records';
const TABLE_RECORD_ITEM_ENDPOINT =
	'/open-apis/bitable/v1/apps/:app_token/tables/:table_id/records/:record_id';
const TABLE_RECORD_SEARCH_ENDPOINT =
	'/open-apis/bitable/v1/apps/:app_token/tables/:table_id/records/search';
const TABLE_RECORD_BATCH_CREATE_ENDPOINT =
	'/open-apis/bitable/v1/apps/:app_token/tables/:table_id/records/batch_create';
const TABLE_RECORD_BATCH_UPDATE_ENDPOINT =
	'/open-apis/bitable/v1/apps/:app_token/tables/:table_id/records/batch_update';
const TABLE_RECORD_BATCH_GET_ENDPOINT =
	'/open-apis/bitable/v1/apps/:app_token/tables/:table_id/records/batch_get';
const TABLE_RECORD_BATCH_DELETE_ENDPOINT =
	'/open-apis/bitable/v1/apps/:app_token/tables/:table_id/records/batch_delete';

const replacePathParams = (template: string, params: Record<string, string>): string => {
	return Object.entries(params).reduce(
		(result, [key, value]) => result.replace(`:${key}`, encodeURIComponent(value)),
		template,
	);
};

export interface CreateAppPayload {
	name: string;
	folder_token?: string;
}

export interface CopyAppPayload {
	app_token: string;
	name: string;
	folder_token?: string;
	without_content?: boolean;
}

export interface UpdateAppNamePayload {
	app_token: string;
	name: string;
	is_advanced?: boolean;
}

export interface ListTablesOptions {
	app_token: string;
	page_token?: string;
	page_size?: number;
}

export interface SearchRecordsOptions {
	app_token: string;
	table_id: string;
	query: IDataObject;
	page_token?: string;
	page_size?: number;
}

export interface BatchGetRecordsOptions {
	app_token: string;
	table_id: string;
	record_ids: string[];
	user_id_type?: string;
	with_shared_url?: boolean;
	automatic_fields?: boolean;
}

export class LarkBaseService extends BaseService {
	constructor(config: BaseServiceConfig) {
		super(config);
	}

	async createApp(payload: CreateAppPayload): Promise<IDataObject> {
		const name = payload.name?.trim();
		if (!name) {
			throw new Error('name is required to create a Base App.');
		}

		const body: IDataObject = {
			name,
		};

		if (payload.folder_token?.trim()) {
			body.folder_token = payload.folder_token.trim();
		}

		const response = await this.post<IDataObject>(CREATE_APP_ENDPOINT, body);
		return response.data;
	}

	async copyApp(payload: CopyAppPayload): Promise<IDataObject> {
		const appToken = payload.app_token?.trim();
		if (!appToken) {
			throw new Error('app_token is required to copy a Base App.');
		}

		const name = payload.name?.trim();
		if (!name) {
			throw new Error('name is required to define the copied Base App.');
		}

		const endpoint = COPY_APP_ENDPOINT.replace(
			':app_token',
			encodeURIComponent(appToken),
		);

		const body: IDataObject = {
			name,
		};

		if (payload.folder_token?.trim()) {
			body.folder_token = payload.folder_token.trim();
		}

		if (typeof payload.without_content === 'boolean') {
			body.without_content = payload.without_content;
		}

		const response = await this.post<IDataObject>(endpoint, body);
		return response.data;
	}

	async getApp(appToken: string): Promise<IDataObject> {
		const normalizedToken = appToken?.trim();
		if (!normalizedToken) {
			throw new Error('app_token is required to get Base App details.');
		}

		const endpoint = APP_INFO_ENDPOINT.replace(
			':app_token',
			encodeURIComponent(normalizedToken),
		);

		const response = await this.get<IDataObject>(endpoint);
		return response.data;
	}

	async updateAppName(payload: UpdateAppNamePayload): Promise<IDataObject> {
		const appToken = payload.app_token?.trim();
		if (!appToken) {
			throw new Error('app_token is required to update Base App name.');
		}

		const name = payload.name?.trim();
		if (!name) {
			throw new Error('name is required to update Base App.');
		}

		const endpoint = APP_INFO_ENDPOINT.replace(
			':app_token',
			encodeURIComponent(appToken),
		);

		const body: IDataObject = {
			name,
		};

		if (typeof payload.is_advanced === 'boolean') {
			body.is_advanced = payload.is_advanced;
		}

		const response = await this.put<IDataObject>(endpoint, body);
		return response.data;
	}

	async createTable(appToken: string, tableDefinition: IDataObject): Promise<IDataObject> {
		const normalizedToken = appToken?.trim();
		if (!normalizedToken) {
			throw new Error('app_token is required to create a Base Table.');
		}

		if (!tableDefinition || typeof tableDefinition !== 'object' || Array.isArray(tableDefinition)) {
			throw new Error('A JSON object describing the table is required.');
		}

		const endpoint = CREATE_TABLE_ENDPOINT.replace(
			':app_token',
			encodeURIComponent(normalizedToken),
		);

		const response = await this.post<IDataObject>(endpoint, tableDefinition);
		return response.data;
	}

	async batchCreateTable(appToken: string, payload: IDataObject): Promise<IDataObject> {
		const normalizedToken = appToken?.trim();
		if (!normalizedToken) {
			throw new Error('app_token is required to batch create Base Tables.');
		}

		if (!payload || typeof payload !== 'object') {
			throw new Error('A JSON object payload is required for batch table creation.');
		}

		const endpoint = BATCH_CREATE_TABLE_ENDPOINT.replace(
			':app_token',
			encodeURIComponent(normalizedToken),
		);

		const response = await this.post<IDataObject>(endpoint, payload);
		return response.data;
	}

	async updateTableName(appToken: string, tableId: string, name: string): Promise<IDataObject> {
		const normalizedAppToken = appToken?.trim();
		if (!normalizedAppToken) {
			throw new Error('app_token is required to update a Base Table.');
		}

		const normalizedTableId = tableId?.trim();
		if (!normalizedTableId) {
			throw new Error('table_id is required to update a Base Table.');
		}

		const normalizedName = name?.trim();
		if (!normalizedName) {
			throw new Error('name is required to update a Base Table.');
		}

		const endpoint = TABLE_ITEM_ENDPOINT.replace(
			':app_token',
			encodeURIComponent(normalizedAppToken),
		).replace(':table_id', encodeURIComponent(normalizedTableId));

		const response = await this.patch<IDataObject>(endpoint, {
			name: normalizedName,
		});

		return response.data;
	}

	async listTables(options: ListTablesOptions): Promise<IDataObject> {
		const normalizedAppToken = options.app_token?.trim();
		if (!normalizedAppToken) {
			throw new Error('app_token is required to list Base Tables.');
		}

		const endpoint = CREATE_TABLE_ENDPOINT.replace(
			':app_token',
			encodeURIComponent(normalizedAppToken),
		);

		const params: IDataObject = {};

		if (options.page_size && options.page_size > 0) {
			if (options.page_size > 100) {
				throw new Error('page_size cannot exceed 100 for list tables.');
			}

			params.page_size = options.page_size;
		}

		if (options.page_token?.trim()) {
			params.page_token = options.page_token.trim();
		}

		const response = await this.get<IDataObject>(endpoint, params);
		return response.data;
	}

	async deleteTable(appToken: string, tableId: string): Promise<IDataObject> {
		const normalizedAppToken = appToken?.trim();
		if (!normalizedAppToken) {
			throw new Error('app_token is required to delete a Base Table.');
		}

		const normalizedTableId = tableId?.trim();
		if (!normalizedTableId) {
			throw new Error('table_id is required to delete a Base Table.');
		}

		const endpoint = TABLE_ITEM_ENDPOINT.replace(
			':app_token',
			encodeURIComponent(normalizedAppToken),
		).replace(':table_id', encodeURIComponent(normalizedTableId));

		const response = await this.delete<IDataObject>(endpoint);
		return response.data;
	}

	async batchDeleteTables(appToken: string, tableIds: string[]): Promise<IDataObject> {
		const normalizedAppToken = appToken?.trim();
		if (!normalizedAppToken) {
			throw new Error('app_token is required to batch delete Base Tables.');
		}

		if (!Array.isArray(tableIds) || tableIds.length === 0) {
			throw new Error('table_ids array is required to batch delete Base Tables.');
		}

		const sanitizedIds = tableIds
			.map((id) => id?.trim())
			.filter((id): id is string => !!id);

		if (sanitizedIds.length === 0) {
			throw new Error('At least one valid table_id is required to batch delete tables.');
		}

		const endpoint = BATCH_DELETE_TABLE_ENDPOINT.replace(
			':app_token',
			encodeURIComponent(normalizedAppToken),
		);

		const response = await this.post<IDataObject>(endpoint, {
			table_ids: sanitizedIds,
		});

		return response.data;
	}

	async createRecord(
		appToken: string,
		tableId: string,
		payload: IDataObject,
	): Promise<IDataObject> {
		const endpoint = this.buildRecordsEndpoint(appToken, tableId, TABLE_RECORDS_ENDPOINT);
		const body = this.normalizePayload(payload);

		const response = await this.post<IDataObject>(endpoint, body);
		return response.data;
	}

	async updateRecord(
		appToken: string,
		tableId: string,
		recordId: string,
		payload: IDataObject,
	): Promise<IDataObject> {
		const endpoint = this.buildRecordItemEndpoint(appToken, tableId, recordId);
		const body = this.normalizePayload(payload);

		const response = await this.put<IDataObject>(endpoint, body);
		return response.data;
	}

	async searchRecords(options: SearchRecordsOptions): Promise<IDataObject> {
		const endpoint = this.buildRecordsEndpoint(
			options.app_token,
			options.table_id,
			TABLE_RECORD_SEARCH_ENDPOINT,
		);

		const body = this.normalizePayload(options.query);

		const params: IDataObject = {};
		if (options.page_size && options.page_size > 0) {
			if (options.page_size > 500) {
				throw new Error('page_size cannot exceed 500 when searching records.');
			}

			params.page_size = options.page_size;
		}

		if (options.page_token?.trim()) {
			params.page_token = options.page_token.trim();
		}

		const response = await this.post<IDataObject>(endpoint, body, {
			params,
		});

		return response.data;
	}

	async deleteRecord(appToken: string, tableId: string, recordId: string): Promise<IDataObject> {
		const endpoint = this.buildRecordItemEndpoint(appToken, tableId, recordId);
		const response = await this.delete<IDataObject>(endpoint);
		return response.data;
	}

	async batchCreateRecords(
		appToken: string,
		tableId: string,
		payload: IDataObject,
	): Promise<IDataObject> {
		const endpoint = this.buildRecordsEndpoint(
			appToken,
			tableId,
			TABLE_RECORD_BATCH_CREATE_ENDPOINT,
		);

		const body = this.normalizePayload(payload);
		const response = await this.post<IDataObject>(endpoint, body);
		return response.data;
	}

	async batchUpdateRecords(
		appToken: string,
		tableId: string,
		payload: IDataObject,
	): Promise<IDataObject> {
		const endpoint = this.buildRecordsEndpoint(
			appToken,
			tableId,
			TABLE_RECORD_BATCH_UPDATE_ENDPOINT,
		);

		const body = this.normalizePayload(payload);
		const response = await this.post<IDataObject>(endpoint, body);
		return response.data;
	}

	async batchGetRecords(options: BatchGetRecordsOptions): Promise<IDataObject> {
		const endpoint = this.buildRecordsEndpoint(
			options.app_token,
			options.table_id,
			TABLE_RECORD_BATCH_GET_ENDPOINT,
		);

		if (!Array.isArray(options.record_ids) || options.record_ids.length === 0) {
			throw new Error('record_ids array is required to batch get records.');
		}

		const payload: IDataObject = {
			record_ids: options.record_ids,
		};

		if (options.user_id_type?.trim()) {
			payload.user_id_type = options.user_id_type.trim();
		}

		if (typeof options.with_shared_url === 'boolean') {
			payload.with_shared_url = options.with_shared_url;
		}

		if (typeof options.automatic_fields === 'boolean') {
			payload.automatic_fields = options.automatic_fields;
		}

		const response = await this.post<IDataObject>(endpoint, payload);
		return response.data;
	}

	async batchDeleteRecords(appToken: string, tableId: string, recordIds: string[]): Promise<IDataObject> {
		const endpoint = this.buildRecordsEndpoint(
			appToken,
			tableId,
			TABLE_RECORD_BATCH_DELETE_ENDPOINT,
		);

		if (!Array.isArray(recordIds) || recordIds.length === 0) {
			throw new Error('records array is required to batch delete records.');
		}

		const sanitizedIds = recordIds
			.map((id) => id?.trim())
			.filter((id): id is string => !!id);

		if (sanitizedIds.length === 0) {
			throw new Error('At least one valid record ID is required to batch delete records.');
		}

		const response = await this.post<IDataObject>(endpoint, {
			records: sanitizedIds,
		});

		return response.data;
	}

	private buildRecordsEndpoint(appToken: string, tableId: string, template: string): string {
		const normalizedAppToken = appToken?.trim();
		if (!normalizedAppToken) {
			throw new Error('app_token is required for record operations.');
		}

		const normalizedTableId = tableId?.trim();
		if (!normalizedTableId) {
			throw new Error('table_id is required for record operations.');
		}

		return replacePathParams(template, {
			app_token: normalizedAppToken,
			table_id: normalizedTableId,
		});
	}

	private buildRecordItemEndpoint(appToken: string, tableId: string, recordId: string): string {
		const endpoint = this.buildRecordsEndpoint(appToken, tableId, TABLE_RECORD_ITEM_ENDPOINT);
		const normalizedRecordId = recordId?.trim();
		if (!normalizedRecordId) {
			throw new Error('record_id is required for this operation.');
		}

		return endpoint.replace(':record_id', encodeURIComponent(normalizedRecordId));
	}

	private normalizePayload(payload: IDataObject): IDataObject {
		if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
			return payload;
		}

		return {};
	}
}
