import axios, { isAxiosError, type AxiosResponse } from 'axios';

export class TokenServiceError extends Error {
	constructor(message: string, options?: { cause?: unknown }) {
		super(message, options);
		this.name = 'TokenServiceError';
	}
}

export const TOKEN_ENDPOINT =
	'https://open.larksuite.com/open-apis/auth/v3/tenant_access_token/internal';

export interface TenantAccessTokenResponse {
	code: number;
	msg?: string;
	tenant_access_token?: string;
	expire?: number;
	[key: string]: unknown;
}

export interface TenantAccessTokenSuccess extends TenantAccessTokenResponse {
	tenant_access_token: string;
	expire: number;
}

export async function getTenantAccessToken({
	appId,
	appSecret,
}: {
	appId: string;
	appSecret: string;
}): Promise<AxiosResponse<TenantAccessTokenSuccess>> {
	try {
		const response = await axios.post<TenantAccessTokenSuccess>(
			TOKEN_ENDPOINT,
			{
				app_id: appId,
				app_secret: appSecret,
			},
			{
				headers: {
					'Content-Type': 'application/json',
				},
			},
		);

		if (
			response.data.code !== 0 ||
			typeof response.data.tenant_access_token !== 'string' ||
			typeof response.data.expire !== 'number'
		) {
			throw new TokenServiceError(
				response.data.msg ??
					`Unexpected Lark response code (${response.data.code ?? 'unknown'}).`,
			);
		}

		return response;
	} catch (error) {
		if (isAxiosError(error)) {
			const message =
				(error.response?.data as TenantAccessTokenResponse | undefined)?.msg ??
				error.message ??
				'Failed to contact Lark tenant access token endpoint.';
			throw new TokenServiceError(message, { cause: error });
		}

		throw new TokenServiceError('Failed to contact Lark tenant access token endpoint.', {
			cause: error,
		});
	}
}
