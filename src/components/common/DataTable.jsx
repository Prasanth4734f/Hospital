import React from 'react';
import Loader from './Loader';
import EmptyState from './EmptyState';
import Pagination from './Pagination';

export const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyTitle = 'No data available',
  emptyDescription = 'There are no records matching your current filter criteria.',
  emptyActionLabel,
  onEmptyAction,
  pagination = null, // { currentPage, totalItems, pageSize, onPageChange }
  className = '',
  rowKey = 'id',
}) => {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col ${className}`}>
      <div className="overflow-x-auto min-h-[220px]">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 tracking-wider border-b border-slate-200">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={col.key || index}
                  scope="col"
                  className={`px-4 py-3.5 ${col.headerClassName || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-12">
                  <Loader message="Loading data..." />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    actionLabel={emptyActionLabel}
                    onAction={onEmptyAction}
                  />
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => {
                const key = row[rowKey] || rowIndex;
                return (
                  <tr
                    key={key}
                    className="hover:bg-slate-50/70 transition-colors duration-100 group"
                  >
                    {columns.map((col, colIndex) => (
                      <td
                        key={col.key || colIndex}
                        className={`px-4 py-3.5 whitespace-nowrap text-sm ${col.className || ''}`}
                      >
                        {col.render ? col.render(row, rowIndex) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && !loading && data.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          onPageChange={pagination.onPageChange}
        />
      )}
    </div>
  );
};

export default DataTable;

