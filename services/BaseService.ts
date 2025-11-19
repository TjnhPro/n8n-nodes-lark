import axios, { AxiosRequestConfig, AxiosResponse, isAxiosError } from 'axios';
import type { IDataObject } from 'n8n-workflow';

const DEFAULT_BASE_URL = 'https://open.larksuite.com';

export interface BaseServiceConfig {
	tenantAccessToken: string;
	baseUrl?: string;
}

export class BaseService {
	protected readonly tenantAccessToken: string;
	protected readonly baseUrl: string;

	constructor(config: BaseServiceConfig) {
		if (!config.tenantAccessToken || config.tenantAccessToken.trim() === '') {
			throw new Error('tenant_access_token is required before calling Lark APIs.');
		}

		this.tenantAccessToken = config.tenantAccessToken;
		this.baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
	}

	protected async request<T = IDataObject>(
		config: AxiosRequestConfig,
	): Promise<AxiosResponse<T>> {
		const headers = {
			Authorization: `Bearer ${this.tenantAccessToken}`,
			'Content-Type': 'application/json',
			...(config.headers ?? {}),
		};

		const requestConfig: AxiosRequestConfig = {
			baseURL: config.baseURL ?? this.baseUrl,
			...config,
			headers,
		};

		try {
			return await axios.request<T>(requestConfig);
		} catch (error) {
			throw this.handleRequestError(error);
		}
	}

	protected async get<T = IDataObject>(
		url: string,
		params?: IDataObject,
		config?: AxiosRequestConfig,
	): Promise<AxiosResponse<T>> {
		return this.request<T>({
			method: 'GET',
			url,
			params,
			...(config ?? {}),
		});
	}

	protected async post<T = IDataObject>(
		url: string,
		data?: IDataObject,
		config?: AxiosRequestConfig,
	): Promise<AxiosResponse<T>> {
		return this.request<T>({
			method: 'POST',
			url,
			data,
			...(config ?? {}),
		});
	}

	protected handleRequestError(error: unknown): Error {
		if (isAxiosError(error)) {
			const responseData = (error.response?.data ?? {}) as IDataObject;
			const codePart =
				typeof responseData.code !== 'undefined' ? `code ${responseData.code}` : undefined;
			const msgPart =
				typeof responseData.msg === 'string' ? responseData.msg : error.message ?? 'Unknown error';
			const statusPart = error.response?.status ? `HTTP ${error.response.status}` : undefined;

			const details = [statusPart, codePart, msgPart].filter(Boolean).join(' - ');
			return new Error(details || 'Lark API request failed.');
		}

		return error instanceof Error ? error : new Error('Unexpected error while calling Lark API.');
	}
}
