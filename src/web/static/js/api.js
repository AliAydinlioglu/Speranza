const API = {
  async request(path, options = {}) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(path, config);
    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}`;
      try {
        const errJson = await response.json();
        if (errJson.detail) {
          errorMessage = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
        }
      } catch (_) {}
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  },

  async checkHealth() {
    return this.request('/health');
  },

  async getLanguages() {
    return this.request('/api/languages');
  },

  async installLanguage(fromCode, toCode) {
    return this.request('/api/languages/install', {
      method: 'POST',
      body: { from_code: fromCode, to_code: toCode },
    });
  },

  async translate(text, sourceLang, targetLangs) {
    return this.request('/api/translate', {
      method: 'POST',
      body: {
        text,
        source_lang: sourceLang,
        target_langs: targetLangs,
      },
    });
  },

  async getBundles() {
    return this.request('/api/bundles');
  },

  async createBundle(name, languages) {
    return this.request('/api/bundles', {
      method: 'POST',
      body: { name, languages },
    });
  },

  async getBundle(id) {
    return this.request(`/api/bundles/${encodeURIComponent(id)}`);
  },

  async addBundleEntry(id, sourceLang, text) {
    return this.request(`/api/bundles/${encodeURIComponent(id)}/entries`, {
      method: 'POST',
      body: { source_lang: sourceLang, text },
    });
  },

  async deleteBundleEntry(bundleId, entryId) {
    return this.request(`/api/bundles/${encodeURIComponent(bundleId)}/entries/${encodeURIComponent(entryId)}`, {
      method: 'DELETE',
    });
  },

  async deleteBundle(id) {
    return this.request(`/api/bundles/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};
window.API = API;
