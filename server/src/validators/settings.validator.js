const validateOpenIDConfig = settings => {
    const {
        openidEnabled,
        openidIssuer,
        openidClientId,
        openidClientSecret,
        openidCallbackUrl,
        openidScopes,
    } = settings;

    // If OpenID is enabled, validate required fields
    if (openidEnabled) {
        if (!openidIssuer) {
            return 'OpenID issuer URL is required when OpenID is enabled';
        }

        if (!openidClientId) {
            return 'OpenID client ID is required when OpenID is enabled';
        }

        if (!openidClientSecret) {
            return 'OpenID client secret is required when OpenID is enabled';
        }

        if (!openidCallbackUrl) {
            return 'OpenID callback URL is required when OpenID is enabled';
        }

        // Validate URL formats
        try {
            new URL(openidIssuer);
            new URL(openidCallbackUrl);
        } catch (error) {
            return 'Invalid URL format for OpenID issuer or callback URL';
        }

        // Validate scopes
        if (!Array.isArray(openidScopes) || openidScopes.length === 0) {
            return 'OpenID scopes must be a non-empty array';
        }

        const requiredScopes = ['openid'];
        const missingScopes = requiredScopes.filter(scope => !openidScopes.includes(scope));
        if (missingScopes.length > 0) {
            return `Required OpenID scopes are missing: ${missingScopes.join(', ')}`;
        }
    }

    return null;
};

module.exports = {
    validateOpenIDConfig,
};
