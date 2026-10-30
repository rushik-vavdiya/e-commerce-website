import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import AdminCategoryForm from '../../components/admin/AdminCategoryForm';
import AdminCategoryList from '../../components/admin/AdminCategoryList';
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader';
import ProductPagination from '../../components/product/ProductPagination';
import Button from '../../components/common/Button';
import { ADMIN_PAGE_SIZE, clampPage, pageCount, pageSlice } from '../../utils/pagination';
import {
  addCategory,
  editCategory,
  editCategoryStatus,
  fetchCategories,
  removeCategory,
  removeCategoryImage,
  saveCategoryImages,
  saveCategoryProducts,
} from '../../slices/categorySlice';
import { getProducts } from '../../services/productService';

// Category management. The API builds the slug from the name and refuses to
// delete a category that still has products or child categories.
//
// The product catalog is read here, through the service, rather than from the
// products slice: the category form needs every product for its checkbox list,
// and that should not replace whatever listing another admin page is showing.
export default function AdminCategories() {
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.categories);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState(null);
  const [page, setPage] = useState(1);
  const [catalog, setCatalog] = useState({ items: [], loading: true, error: null });

  // The list is paged in the browser (the categories API returns them all at
  // once). The form keeps the full set — its parent picker needs every one.
  const pages = pageCount(categories.items.length);
  const activePage = clampPage(page, pages);
  const visibleCategories = pageSlice(categories.items, activePage);

  // The one request the picker needs. It is kept separate from the state update
  // so the first load can happen inside an effect without a synchronous setState.
  const fetchCatalog = useCallback(async () => {
    const response = await getProducts({ limit: 100, sort: 'az' });
    return response?.data ?? [];
  }, []);

  // Refresh after a save, once the server has the new assignments.
  const loadCatalog = useCallback(async () => {
    setCatalog((current) => ({ ...current, loading: true, error: null }));

    try {
      const items = await fetchCatalog();
      setCatalog({ items, loading: false, error: null });
    } catch (error) {
      setCatalog({
        items: [],
        loading: false,
        error: error?.response?.data?.message ?? error.message,
      });
    }
  }, [fetchCatalog]);

  useEffect(() => {
    dispatch(fetchCategories());

    let cancelled = false;

    fetchCatalog()
      .then((items) => {
        if (!cancelled) setCatalog({ items, loading: false, error: null });
      })
      .catch((error) => {
        if (cancelled) return;
        setCatalog({
          items: [],
          loading: false,
          error: error?.response?.data?.message ?? error.message,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [dispatch, fetchCatalog]);

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (values, images, selection = {}) => {
    setBusyId(editing ? editing._id : 'new');
    setNotice(null);

    const wasEditing = Boolean(editing);
    const productIds = selection?.productIds ?? [];

    try {
      let categoryId;
      if (editing) {
        await dispatch(editCategory({ categoryId: editing._id, category: values })).unwrap();
        categoryId = editing._id;
      } else {
        const created = await dispatch(addCategory(values)).unwrap();
        categoryId = created.data._id;
      }

      closeForm();
      if (images.image || images.bannerImage) {
        try {
          await dispatch(
            saveCategoryImages({ categoryId, images }),
          ).unwrap();
        } catch (message) {
          setNotice({
            tone: 'error',
            text: `Category ${wasEditing ? 'saved' : 'created'}, but its images could not be saved: ${String(message)}`,
          });
          return;
        }
      }

      // The picker sends the whole set of ticked products. A brand new category
      // with nothing ticked needs no request at all.
      if (wasEditing || productIds.length > 0) {
        try {
          await dispatch(saveCategoryProducts({ categoryId, productIds })).unwrap();
        } catch (message) {
          setNotice({
            tone: 'error',
            text: `Category ${wasEditing ? 'saved' : 'created'}, but its products could not be updated: ${String(message)}`,
          });
          loadCatalog();
          return;
        }
      }

      setNotice({
        tone: 'success',
        text: `“${values.name}” ${wasEditing ? 'updated' : 'created'}${productIds.length > 0 ? ` with ${productIds.length} ${productIds.length === 1 ? 'product' : 'products'}` : ''}.`,
      });
      loadCatalog();
    } catch (message) {
      setNotice({ tone: 'error', text: String(message) });
    } finally {
      setBusyId(null);
    }
  };

  // Removing a saved image is its own request: the card is redrawn from the
  // category the API returns, so the preview disappears straight away.
  const handleRemoveImage = async (imageType) => {
    if (!editing) return;

    setBusyId(editing._id);
    setNotice(null);

    try {
      const result = await dispatch(
        removeCategoryImage({ categoryId: editing._id, imageType }),
      ).unwrap();

      setEditing(result.data);
      setNotice({
        tone: 'success',
        text: `${imageType === 'banner' ? 'Banner' : 'Category image'} removed.`,
      });
    } catch (message) {
      setNotice({ tone: 'error', text: String(message) });
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleStatus = async (categoryId, status) => {
    setBusyId(categoryId);
    setNotice(null);

    try {
      await dispatch(editCategoryStatus({ categoryId, status })).unwrap();
      setNotice({ tone: 'success', text: `Category is now ${status}.` });
    } catch (message) {
      setNotice({ tone: 'error', text: String(message) });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (categoryId) => {
    setBusyId(categoryId);
    setNotice(null);

    try {
      await dispatch(removeCategory(categoryId)).unwrap();
      setNotice({ tone: 'success', text: 'Category deleted.' });
    } catch (message) {
      setNotice({ tone: 'error', text: String(message) });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Catalog"
        title="Category management"
        description={`${categories.items.length} categories. A category holds its products; only active categories can hold published products.`}
      >
        <Button
          variant="primary"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          disabled={formOpen && !editing}
        >
          New category
        </Button>
      </DashboardPageHeader>

      {notice && (
        <p
          role={notice.tone === 'success' ? 'status' : 'alert'}
          className={[
            'rounded-3xl border px-5 py-4 text-sm',
            notice.tone === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-peach bg-peach/30 text-primary',
          ].join(' ')}
        >
          {notice.text}
        </p>
      )}

      {formOpen && (
        <AdminCategoryForm
          initial={editing}
          categories={categories.items}
          products={catalog.items}
          productsLoading={catalog.loading}
          productsError={catalog.error}
          onSubmit={handleSubmit}
          onCancel={closeForm}
          onRemoveImage={handleRemoveImage}
          busy={busyId === (editing ? editing._id : 'new')}
        />
      )}

      <AdminCategoryList
        categories={visibleCategories}
        loading={categories.loading && categories.items.length === 0}
        error={categories.items.length === 0 ? categories.error : null}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDelete}
        onEdit={(category) => {
          setEditing(category);
          setFormOpen(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        busyId={busyId}
      />

      <ProductPagination
        label="Category pages"
        page={activePage}
        pages={pages}
        total={categories.items.length}
        limit={ADMIN_PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}
