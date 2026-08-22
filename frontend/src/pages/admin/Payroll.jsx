import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { payrollAPI, profileAPI } from '../../services/api';
import { Wallet, Save, Zap, History, Check, AlertCircle } from 'lucide-react';

export default function AdminPayroll() {
  const [salaries, setSalaries] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('structures'); // structures | process | history
  const [selectedUser, setSelectedUser] = useState('');
  const [salaryForm, setSalaryForm] = useState({
    basicSalary: 0,
    allowances: { house: 0, transport: 0, medical: 0, other: 0 },
    deductions: 0,
    currency: 'INR',
  });
  const [processForm, setProcessForm] = useState({
    userId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [salRes, profRes, recRes] = await Promise.allSettled([
        payrollAPI.getAllSalaries(),
        profileAPI.getAllProfiles(),
        payrollAPI.getAllPayrollRecords(),
      ]);
      if (salRes.status === 'fulfilled') setSalaries(salRes.value.data.salaries || []);
      if (profRes.status === 'fulfilled') setProfiles(profRes.value.data.profiles || []);
      if (recRes.status === 'fulfilled') setRecords(recRes.value.data.records || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectUserToEdit = (userId) => {
    setSelectedUser(userId);
    const existing = salaries.find((s) => s.userId?._id === userId || s.userId === userId);
    if (existing) {
      setSalaryForm({
        basicSalary: existing.basicSalary || 0,
        allowances: {
          house: existing.allowances?.house || 0,
          transport: existing.allowances?.transport || 0,
          medical: existing.allowances?.medical || 0,
          other: existing.allowances?.other || 0,
        },
        deductions: existing.deductions || 0,
        currency: existing.currency || 'INR',
      });
    } else {
      setSalaryForm({
        basicSalary: 0,
        allowances: { house: 0, transport: 0, medical: 0, other: 0 },
        deductions: 0,
        currency: 'INR',
      });
    }
  };

  const handleSaveSalary = async (e) => {
    e.preventDefault();
    if (!selectedUser) return setMsg({ text: 'Please select an employee first.', type: 'error' });
    setSaving(true);
    try {
      await payrollAPI.upsertSalary(selectedUser, salaryForm);
      setMsg({ text: 'Salary compensation structure updated successfully.', type: 'success' });
      fetchData();
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Failed to update salary structure', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleProcessPayroll = async (e) => {
    e.preventDefault();
    if (!processForm.userId) return setMsg({ text: 'Please select an employee to process.', type: 'error' });
    setSaving(true);
    try {
      await payrollAPI.processPayroll(processForm.userId, {
        month: Number(processForm.month),
        year: Number(processForm.year),
      });
      setMsg({ text: 'Monthly payroll processed and employee notification sent.', type: 'success' });
      fetchData();
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Failed to process payroll', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const calculatedNet =
    Number(salaryForm.basicSalary || 0) +
    Number(salaryForm.allowances?.house || 0) +
    Number(salaryForm.allowances?.transport || 0) +
    Number(salaryForm.allowances?.medical || 0) +
    Number(salaryForm.allowances?.other || 0) -
    Number(salaryForm.deductions || 0);

  return (
    <Layout title="Payroll">
      <div className="page-header">
        <div>
          <h2 className="page-title">Payroll & Compensation</h2>
          <p className="page-subtitle">Configure employee salary structures, execute monthly disbursements, and view logs.</p>
        </div>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type}`} onClick={() => setMsg({ text: '', type: '' })}>
          {msg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="card mb-6" style={{ padding: 'var(--space-4)' }}>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <span className="text-sm font-semibold text-primary">Administration Mode</span>
          <div className="flex gap-2">
            <button
              className={`btn btn-sm ${activeTab === 'structures' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('structures')}
            >
              <Wallet size={14} /> Salary Structures
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'process' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('process')}
            >
              <Zap size={14} /> Process Monthly Payroll
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('history')}
            >
              <History size={14} /> Historical Records
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-page">
          <div className="spinner-lg" />
        </div>
      ) : activeTab === 'structures' ? (
        <div className="grid-2">
          {/* Configure Form */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Salary Configuration</h3>
                <p className="card-subtitle">Set components for an employee</p>
              </div>
            </div>

            <form onSubmit={handleSaveSalary}>
              <div className="form-group">
                <label className="form-label">Employee</label>
                <select
                  className="form-select"
                  value={selectedUser}
                  onChange={(e) => handleSelectUserToEdit(e.target.value)}
                  required
                >
                  <option value="">-- Choose Employee --</option>
                  {profiles.map((p) => (
                    <option key={p.userId?._id || p._id} value={p.userId?._id || p.userId}>
                      {p.firstName} {p.lastName} ({p.userId?.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Base Monthly Salary (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={salaryForm.basicSalary}
                    onChange={(e) => setSalaryForm({ ...salaryForm, basicSalary: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select
                    className="form-select"
                    value={salaryForm.currency}
                    onChange={(e) => setSalaryForm({ ...salaryForm, currency: e.target.value })}
                  >
                    <option value="INR">INR (₹ - Indian Rupee)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">House Rent Allowance (HRA)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={salaryForm.allowances.house}
                    onChange={(e) =>
                      setSalaryForm({
                        ...salaryForm,
                        allowances: { ...salaryForm.allowances, house: Number(e.target.value) },
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Transport Allowance</label>
                  <input
                    type="number"
                    className="form-input"
                    value={salaryForm.allowances.transport}
                    onChange={(e) =>
                      setSalaryForm({
                        ...salaryForm,
                        allowances: { ...salaryForm.allowances, transport: Number(e.target.value) },
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Medical Allowance</label>
                  <input
                    type="number"
                    className="form-input"
                    value={salaryForm.allowances.medical}
                    onChange={(e) =>
                      setSalaryForm({
                        ...salaryForm,
                        allowances: { ...salaryForm.allowances, medical: Number(e.target.value) },
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Other Allowances</label>
                  <input
                    type="number"
                    className="form-input"
                    value={salaryForm.allowances.other}
                    onChange={(e) =>
                      setSalaryForm({
                        ...salaryForm,
                        allowances: { ...salaryForm.allowances, other: Number(e.target.value) },
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Total Monthly Deductions (PF, PT, TDS)</label>
                <input
                  type="number"
                  className="form-input"
                  value={salaryForm.deductions}
                  onChange={(e) => setSalaryForm({ ...salaryForm, deductions: Number(e.target.value) })}
                />
              </div>

              <div
                className="flex justify-between items-center"
                style={{
                  padding: '10px 14px',
                  background: 'var(--bg-app)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  marginBottom: 'var(--space-4)',
                }}
              >
                <span className="text-xs font-semibold text-secondary">Calculated Net Monthly Pay:</span>
                <span className="text-md font-bold text-indigo">
                  ₹{calculatedNet.toLocaleString('en-IN')}
                </span>
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
                {saving ? <span className="spinner" /> : <><Save size={16} /> Save Salary Structure</>}
              </button>
            </form>
          </div>

          {/* Active Structures List */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Established Structures</h3>
                <p className="card-subtitle">Active compensation configurations</p>
              </div>
            </div>

            {salaries.length === 0 ? (
              <EmptyState
                title="No salary structures"
                description="Assign salary structures using the configuration form."
                icon={Wallet}
              />
            ) : (
              <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Base</th>
                      <th>Deductions</th>
                      <th>Net Take-Home</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaries.map((s) => (
                      <tr key={s._id}>
                        <td>
                          <div className="font-semibold text-primary text-sm">
                            {s.userId?.employeeId || '—'}
                          </div>
                          <div className="text-xs text-muted">{s.userId?.email}</div>
                        </td>
                        <td className="text-secondary">₹{Number(s.basicSalary || 0).toLocaleString('en-IN')}</td>
                        <td className="text-danger">-₹{Number(s.deductions || 0).toLocaleString('en-IN')}</td>
                        <td className="font-bold text-primary">₹{Number(s.netSalary || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'process' ? (
        <div className="card" style={{ maxWidth: 540, margin: '0 auto' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Process Monthly Payroll</h3>
              <p className="card-subtitle">Generate payslip and dispatch employee alert</p>
            </div>
          </div>

          <form onSubmit={handleProcessPayroll}>
            <div className="form-group">
              <label className="form-label">Employee</label>
              <select
                className="form-select"
                value={processForm.userId}
                onChange={(e) => setProcessForm({ ...processForm, userId: e.target.value })}
                required
              >
                <option value="">-- Choose Employee --</option>
                {profiles.map((p) => (
                  <option key={p.userId?._id || p._id} value={p.userId?._id || p.userId}>
                    {p.firstName} {p.lastName} ({p.userId?.employeeId})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Payroll Month</label>
                <select
                  className="form-select"
                  value={processForm.month}
                  onChange={(e) => setProcessForm({ ...processForm, month: e.target.value })}
                >
                  {[
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                  ].map((m, i) => (
                    <option key={i + 1} value={i + 1}>
                      {m} ({i + 1})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Year</label>
                <input
                  type="number"
                  className="form-input"
                  value={processForm.year}
                  onChange={(e) => setProcessForm({ ...processForm, year: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg mt-4" disabled={saving}>
              {saving ? <span className="spinner" /> : <><Zap size={16} /> Execute Payroll Batch</>}
            </button>
          </form>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Month / Year</th>
                <th>Gross Pay</th>
                <th>Deductions</th>
                <th>Net Disbursed</th>
                <th>Status</th>
                <th>Processed On</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id}>
                  <td>
                    <div className="font-semibold text-primary text-sm">{r.userId?.employeeId || '—'}</div>
                    <div className="text-xs text-muted">{r.userId?.email}</div>
                  </td>
                  <td className="text-secondary">{r.month}/{r.year}</td>
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
    </Layout>
  );
}
