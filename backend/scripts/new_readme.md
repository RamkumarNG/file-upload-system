
# File Upload and Dynamic Filtering System

This README outlines the core components and functionality introduced to support efficient file uploads, deduplication, and advanced dynamic filtering and search capabilities in the system.

---

## 1. File Upload Enhancements

### **File Model**

* Added **file_hash field** to **store file hash** which can be used to **find** the **duplicate files**

### FileUpload Model

- Tracks duplicate file uploads by referencing the original file.
- Helps in deduplication and optimizing storage usage.

### Custom Create Method

- Implemented in `FileSerializer`.
- Supports saving references to the original file during duplicate uploads.

### `get_storage` Endpoint

- Returns:

-`total_uploads`: Total number of file upload requests (including duplicates).

-`savings`: Space saved due to deduplication.

-`actual_storage`: Physical disk storage actually consumed.

---

## 2. Advanced Filtering and Searching

### Models Introduced

-`FormElement`: Represents form elements (e.g., text box, dropdown).

-`Form`: Represents a logical group of fields, mapped to file metadata.

-`FormField`: Links data columns to form elements and forms.

### Filter/Search Payload Structure

```json
{
	filters: [{"field": "col", "type": "exact", "value": []}]
	search: "keyword"
}
```

### POST-based Search API

- Supports dynamic filter, search, and pagination.
- Powered by a handler (currently `FileViewHandler`, to be generalized).

#### Handler Responsibilities

-`get_queryset`: Fetch model data.

-`get_unique_cols`: Return unique values for filters.

-`get_fields_meta_info`: Dynamic field capability metadata.

-`serialize`: Handle data serialization.

-`get_serializer_context`: Prepare serializer context.

#### Pagination Support

-`CollectionViewPagination`: Base pagination class.

-`SearchViewPagination`: Extends base with search-specific support.

#### Request Validation

-`SearchRequestValidator`:

- Validates `filters`, `search`, `sort`.
- Contains:

-`filter_and_sort`: Applies filters, search, and sorting.

-`filter_queryset`: Constructs and applies filter logic.

-`search_queryset`: Constructs and applies search logic.

### MetaInfoView Endpoint (`GET`)

- Dynamically returns field metadata:
- Filterable, searchable, sortable fields.
- Uses the same handler logic to introspect dynamically.

---

## 3. Serializers and Pagination Classes

### Serializers

-`FileUploadSerializer`: For uploading files.

-`FileSerializer`: Custom create method to handle file reference logic.

-`FilterSerializer`: Validates filter structure.

-`SortSerializer`: Validates sorting rules.

-`SearchRequestValidator`: Central validation class for dynamic search.

### Pagination

-`CollectionViewPagination`: DRF-compatible base class.

-`SearchViewPagination`: Inherits and customizes for search API.

### 📈 How Pagination Supports Scalability

As the number of uploaded files grows significantly, loading and transmitting all file records at once becomes inefficient and resource-intensive. Pagination ensures that:

-**Only a subset of records are loaded per request**, reducing memory and bandwidth usage.

-**Client-side performance remains fast**, since users only see a limited set of files at a time.

-**Server response times are optimized**, especially when the dataset grows into the millions.

-**APIs scale better under load**, enabling high concurrency and reduced timeouts.

#### Pagination Flow

1. Client sends a request with optional `page` and `page_size` parameters.
2. The handler applies filters/search and returns only the relevant slice of results.
3. The response includes:

-`results`: List of files on the current page.

-`count`: Total matching records.

-`next`/`previous`: Pagination links for navigation.

#### Custom Pagination Classes

-`CollectionViewPagination`: A generic pagination class that aligns with DRF standards.

-`SearchViewPagination`: Inherits from the base and integrates with dynamic filtering logic to paginate filtered/search results seamlessly.

This approach ensures the system remains responsive, even with **tens of millions** of file records, and can handle **dynamic queries** without performance degradation.

---

## 4. Logging Enhancements

- Improved logging setup in `settings.py` to support debugging and smoother development workflows.

---

## 5. Initialization Scripts (`init_scripts.py`)

### create\_form\_element

- Sets up form elements such as:
- Text box, dropdown, single/multi choice, date picker, etc.

### create\_file\_meta

- Creates and configures `FormField`s for file metadata columns.
- Enables flags for:
- Sortable, searchable, filterable fields.

### Notes

- Scripts are modular and idempotent.
- DB is automatically updated upon changes to configuration.
