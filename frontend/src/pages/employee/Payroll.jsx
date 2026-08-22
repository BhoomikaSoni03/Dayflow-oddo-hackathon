import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { payrollAPI } from '../../services/api';
import { Wallet, FileText, ArrowDownRight, ArrowUpRight } from 'lucide-react';

export default function EmployeePayroll() {
  const [salary, setSalary] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        const [salRes, recRes] = await Promise.allSettled([
          payrollAPI.getMySalary(),
          payrollAPI.getMyPayrollRecords(),
        ]);
        if (salRes.status === 'fulfilled') setSalary(salRes.value.data.salary || null);
        if (recRes.status === 'fulfilled') setRecords(recRes.value.data.records || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayroll();
  }, []);

  const totalAllowances = salary?.allowances
    ? (salary.allowances.house || 0) +
      (salary.allowances.transport || 0) +
      (salary.allowances.medical || 0) +
      (salary.allowances.other || 0)
    : 0;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <Layout title="Salary & Payslips">
      <div className="page-header">
        <div>
          <h2 className="page-title">Compensation & Payslips</h2>
          <p className="page-subtitle">View your monthly salary breakdown in Indian Rupees (₹) and download payslips.</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-page">
          <div className="spinner-lg" />
        </div>
      ) : (
        <>
          {/* Salary Breakdown Card */}
          <div className="card mb-6">
            <div className="card-header">
              <div>
                <h3 className="card-title">Salary Breakdown</h3>
                <p className="card-subtitle">
                  Effective from: {salary?.effectiveFrom ? new Date(salary.effectiveFrom).toLocaleDateString('en-IN') : 'Active cycle'}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-muted font-medium uppercase">Net Take-Home Pay</span>
                <div className="text-2xl font-bold text-indigo">
                  ₹{Number(salary?.netSalary || 0).toLocaleString('en-IN')}
                  <span className="text-xs text-muted font-normal"> / month</span>
                </div>
              </div>
            </div>

            {salary ? (
              <div className="grid-3 gap-4">
                <div className="stat-card" style={{ boxShadow: 'none', background: 'var(--bg-app)' }}>
                  <span className="stat-card-label">Basic Salary</span>
                  <div className="text-xl font-bold text-primary mt-2">
                    ₹{Number(salary.basicSalary || 0).toLocaleString('en-IN')}
                  </div>
                  <span className="text-xs text-muted mt-1">Base monthly compensation</span>
                </div>

                <div className="stat-card" style={{ boxShadow: 'none', background: 'var(--bg-app)' }}>
                  <span className="stat-card-label">Allowances Total</span>
                  <div className="text-xl font-bold text-success mt-2 flex items-center gap-1">
                    <ArrowUpRight size={16} /> +₹{Number(totalAllowances).toLocaleString('en-IN')}
                  </div>
                  <span className="text-xs text-muted mt-1">
                    HRA: ₹{Number(salary.allowances?.house || 0).toLocaleString('en-IN')} | Trans: ₹{Number(salary.allowances?.transport || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="stat-card" style={{ boxShadow: 'none', background: 'var(--bg-app)' }}>
                  <span className="stat-card-label">Monthly Deductions</span>
                  <div className="text-xl font-bold text-danger mt-2 flex items-center gap-1">
                    <ArrowDownRight size={16} /> -₹{Number(salary.deductions || 0).toLocaleString('en-IN')}
                  </div>
                  <span className="text-xs text-muted mt-1">Provident Fund (PF), PT & TDS</span>
                </div>
              </div>
            ) : (
              <EmptyState
                title="No salary structure assigned"
                description="Please contact the HR department to configure your compensation structure."
                icon={Wallet}
              />
            )}
          </div>

          {/* Payslip History */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Disbursed Payslips</h3>
                <p className="card-subtitle">Monthly payroll payment records</p>
              </div>
              <FileText size={16} className="text-muted" />
            </div>

            {records.length === 0 ? (
              <EmptyState
                title="No payslips issued"
                description="Your monthly payroll records will appear here once processed by HR."
                icon={FileText}
              />
            ) : (
              <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Disbursement Period</th>
                      <th>Gross Pay</th>
                      <th>Total Deductions</th>
                      <th>Net Disbursed</th>
                      <th>Status</th>
                      <th>Processed Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r) => (
                      <tr key={r._id}>
                        <td className="font-semibold text-primary">
                          {monthNames[r.month - 1]} {r.year}
                        </td>
                        <td className="text-secondary">₹{Number(r.grossPay || 0).toLocaleString('en-IN')}</td>
                        <td className="text-danger">-₹{Number(r.totalDeductions || 0).toLocaleString('en-IN')}</td>
                        <td className="font-bold text-primary">₹{Number(r.netPay || 0).toLocaleString('en-IN')}</td>
                        <td>
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="text-xs text-muted">
                          {r.processedAt ? new Date(r.processedAt).toLocaleDateString('en-IN') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
}
