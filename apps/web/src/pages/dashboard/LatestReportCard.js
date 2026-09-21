import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { ArrowRight, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { getLatestHealthReport, REPORT_RANGE_OPTIONS, } from "../../api/reports";
const RANGE_LABEL = Object.fromEntries(REPORT_RANGE_OPTIONS.map((option) => [option.value, option.label]));
const formatDateTime = (iso) => new Date(iso).toLocaleString();
const LatestReportCard = () => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const load = async () => {
            try {
                const result = await getLatestHealthReport();
                setReport(result.report);
            }
            catch (error) {
                console.error("Failed to load latest health report:", error);
            }
            finally {
                setLoading(false);
            }
        };
        load();
    }, []);
    return (_jsxs("div", { className: "widget-card glass-card health-snapshot", children: [_jsx("div", { className: "widget-header", children: _jsxs("div", { className: "widget-title", children: [_jsx("div", { className: "widget-icon purple", children: _jsx(FileText, { size: 19 }) }), _jsxs("div", { children: [_jsx("h3", { children: "Latest health report" }), _jsx("p", { children: "Your most recent comprehensive report" })] })] }) }), _jsx("div", { className: "latest-report-body", children: loading ? (_jsx("span", { children: "Loading..." })) : report ? (_jsxs(_Fragment, { children: [_jsx("strong", { children: RANGE_LABEL[report.rangeKey] }), _jsxs("span", { children: ["Generated ", formatDateTime(report.createdAt)] })] })) : (_jsx("span", { children: "No health report generated yet." })) }), _jsxs(Link, { to: report ? `/reports?id=${report.id}` : "/reports", className: "secondary-action", children: [report ? "View report" : "Generate your first report", _jsx(ArrowRight, { size: 15 })] })] }));
};
export default LatestReportCard;
