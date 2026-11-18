import { Route, Routes } from 'react-router-dom';
import RequireAdmin from './components/RequireAdmin.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import PublicLayout from './layouts/PublicLayout.jsx';
import NotFound from './pages/NotFound.jsx';
import ArticleForm from './pages/admin/ArticleForm.jsx';
import AdminArticles from './pages/admin/Articles.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import Login from './pages/admin/Login.jsx';
import ArticleDetail from './pages/public/ArticleDetail.jsx';
import Articles from './pages/public/Articles.jsx';
import Landing from './pages/public/Landing.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />

      <Route element={<RequireAdmin />}>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="artikel" element={<AdminArticles />} />
          <Route path="artikel/tambah" element={<ArticleForm />} />
          <Route path="artikel/:id/edit" element={<ArticleForm />} />
        </Route>
      </Route>

      <Route element={<PublicLayout />}>
        <Route index element={<Landing />} />
        <Route path="artikel" element={<Articles />} />
        <Route path="artikel/:slug" element={<ArticleDetail />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
