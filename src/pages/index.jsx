import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import CreateLink from "./CreateLink";

import Partnerships from "./Partnerships";

import About from "./About";

import Settings from "./Settings";

import Redirect from "./Redirect";

import App from "./App";

import GoLink from "./GoLink";

import ApiDubCoCreateLink from "./ApiDubCoCreateLink";

import ApiDubCoGetStats from "./ApiDubCoGetStats";

import BusinessPartnership from "./BusinessPartnership";

import BusinessDirectory from "./BusinessDirectory";

import AdminPanel from "./AdminPanel";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {

    Dashboard: Dashboard,

    CreateLink: CreateLink,

    Partnerships: Partnerships,

    About: About,

    Settings: Settings,

    Redirect: Redirect,

    App: App,

    GoLink: GoLink,

    ApiDubCoCreateLink: ApiDubCoCreateLink,

    ApiDubCoGetStats: ApiDubCoGetStats,

    BusinessPartnership: BusinessPartnership,

    BusinessDirectory: BusinessDirectory,

    AdminPanel: AdminPanel,

}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);

    return (
        <Layout currentPageName={currentPage}>
            <Routes>

                <Route path="/" element={<Dashboard />} />


                <Route path="/Dashboard" element={<Dashboard />} />

                <Route path="/CreateLink" element={<CreateLink />} />

                <Route path="/Partnerships" element={<Partnerships />} />

                <Route path="/About" element={<About />} />

                <Route path="/Settings" element={<Settings />} />

                <Route path="/Redirect" element={<Redirect />} />

                <Route path="/App" element={<App />} />

                <Route path="/GoLink" element={<GoLink />} />

                <Route path="/ApiDubCoCreateLink" element={<ApiDubCoCreateLink />} />

                <Route path="/ApiDubCoGetStats" element={<ApiDubCoGetStats />} />

                <Route path="/BusinessPartnership" element={<BusinessPartnership />} />

                <Route path="/BusinessDirectory" element={<BusinessDirectory />} />

                <Route path="/AdminPanel" element={<AdminPanel />} />

            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}