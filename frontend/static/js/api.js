const API = {
  async request(path, options = {}) {
    const isFormData = options.body instanceof FormData;
    const config = {
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
      ...options,
    };

    if (!isFormData && config.body && typeof config.body === 'object') {
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

  async createBundle(name, languages, styleId = null) {
    const body = { name, languages };
    if (styleId) body.style_id = styleId;
    return this.request('/api/bundles', {
      method: 'POST',
      body,
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

  async getWordfreqCandidates(lang = 'en', topN = 100, rankStart = 0) {
    const params = new URLSearchParams({ lang, top_n: String(topN), rank_start: String(rankStart) });
    return this.request(`/api/corpus/presets/wordfreq?${params.toString()}`);
  },

  async getSentenceCategories() {
    return this.request('/api/corpus/presets/sentence-categories');
  },

  async getSentenceCandidates(category = null, count = 50) {
    const params = new URLSearchParams({ count: String(count) });
    if (category && category !== 'all') {
      params.append('category', category);
    }
    return this.request(`/api/corpus/presets/sentences?${params.toString()}`);
  },

  async analyzeCorpusText(text, mode = 'words', topN = 50, filterStopwords = true, minLength = 3) {
    return this.request('/api/corpus/analyze/text', {
      method: 'POST',
      body: {
        text,
        mode,
        top_n: topN,
        filter_stopwords: filterStopwords,
        min_length: minLength,
      },
    });
  },

  async analyzeCorpusFile(formData) {
    return this.request('/api/corpus/analyze/file', {
      method: 'POST',
      body: formData,
    });
  },

  async bulkGenerateBundle(bundleName, bundleId, languages, sourceLang, phrases, styleId = null) {
    const body = {
      bundle_name: bundleName,
      bundle_id: bundleId,
      languages,
      source_lang: sourceLang,
      phrases,
    };
    if (styleId) body.style_id = styleId;
    return this.request('/api/bundles/bulk-generate', {
      method: 'POST',
      body,
    });
  },

  async getBulkTaskProgress(taskId) {
    return this.request(`/api/bundles/bulk-tasks/${encodeURIComponent(taskId)}`);
  },

  async updateBundleLanguages(bundleId, languages) {
    return this.request(`/api/bundles/${encodeURIComponent(bundleId)}/languages`, {
      method: 'PATCH',
      body: { languages },
    });
  },
};
window.API = API;
