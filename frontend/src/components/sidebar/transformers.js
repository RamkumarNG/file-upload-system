const extractMetaInfoData = (data) => {
  console.log('extractMetaInfoData', {data});
    const filterFields = data?.['filterable_fields']?.map((d) => ({
        "title": d.label,
        "field": d.field,
        "values": d.values ?? [],
        "type": d.extras['type'] ?? '',
    }));

    const searchFields = data?.['searchable_fields']?.map((d) => ({
        "title": d.label,
        "field": d.field,
    }));

    return {
        filterFields,
        searchFields,
    };
};

const getPageNumFromUrl = (url) => {
    if (!url) return 1;
    try {
      const parsed = new URL(url);
      const page = parsed.searchParams.get('page_num');
      return page ? parseInt(page) : 1;
    } catch (e) {
      return 1;
    }
  };
  

export {
    extractMetaInfoData,
    getPageNumFromUrl
};