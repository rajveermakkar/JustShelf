import React from 'react';
import { FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const AdminTable = ({
  columns,
  data,
  onView,
  onEdit,
  onDelete,
  imageKey = 'image_url',
  titleKey = 'title',
  subtitleKey = 'subtitle',
  subtitlePrefix = '',
  detailsPath = '/books'
}) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.width || ''}`}
                >
                  {column.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '100px' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.id}>
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-4">
                    {column.key === 'main' ? (
                      <div className="flex items-center space-x-4">
                        <Link 
                          to={`${detailsPath}/${item.id}`}
                          className="flex-shrink-0 w-12 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                          <img
                            className="h-12 w-12 rounded-md object-cover"
                            src={item[imageKey] || '/placeholder-image.png'}
                            alt={item[titleKey]}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/placeholder-image.png';
                            }}
                          />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link 
                            to={`${detailsPath}/${item.id}`}
                            className="text-sm font-medium text-gray-900 truncate hover:text-primary transition-colors"
                          >
                            {item[titleKey]}
                          </Link>
                          {item[subtitleKey] && (
                            <div className="text-xs text-gray-500 truncate">
                              {subtitlePrefix}{item[subtitleKey]}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-900 truncate">
                        {column.format ? column.format(item[column.key]) : item[column.key]}
                      </div>
                    )}
                  </td>
                ))}
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {onView && (
                      <button
                        onClick={() => onView(item)}
                        className="text-[#E6A74A] cursor-pointer"
                        title="View Details"
                      >
                        <FiEye size={18} />
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(item)}
                        className="text-blue-600 cursor-pointer"
                        title="Edit"
                      >
                        <FiEdit size={18} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(item.id)}
                        className="text-red-600 cursor-pointer"
                        title="Delete"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTable;