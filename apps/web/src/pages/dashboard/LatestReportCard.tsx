import { useEffect, useState } from "react";
import { ArrowRight, FileText } from "lucide-react";
import { Link } from "react-router-dom";

import {
  getLatestHealthReport,
  REPORT_RANGE_OPTIONS,
  type HealthReportSummary,
  type ReportRange,
} from "../../api/reports";

const RANGE_LABEL: Record<ReportRange, string> = Object.fromEntries(
  REPORT_RANGE_OPTIONS.map((option) => [option.value, option.label])
) as Record<ReportRange, string>;

const formatDateTime = (iso: string) => new Date(iso).toLocaleString();

const LatestReportCard = () => {
  const [report, setReport] = useState<HealthReportSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getLatestHealthReport();
        setReport(result.report);
      } catch (error) {
        console.error("Failed to load latest health report:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="widget-card glass-card health-snapshot">
      <div className="widget-header">
        <div className="widget-title">
          <div className="widget-icon purple">
            <FileText size={19} />
          </div>

          <div>
            <h3>Latest health report</h3>
            <p>Your most recent comprehensive report</p>
          </div>
        </div>
      </div>

      <div className="latest-report-body">
        {loading ? (
          <span>Loading...</span>
        ) : report ? (
          <>
            <strong>{RANGE_LABEL[report.rangeKey]}</strong>
            <span>Generated {formatDateTime(report.createdAt)}</span>
          </>
        ) : (
          <span>No health report generated yet.</span>
        )}
      </div>

      <Link
        to={report ? `/reports?id=${report.id}` : "/reports"}
        className="secondary-action"
      >
        {report ? "View report" : "Generate your first report"}
        <ArrowRight size={15} />
      </Link>
    </div>
  );
};

export default LatestReportCard;
