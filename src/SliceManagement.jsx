// SliceManagement.js
import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const SliceManagement = ({
  showSliceManagement,
  setShowSliceManagement,
  slices,
  selectedLabel,
  handleSelectSlice,
  handleAddClick,
  isAdding,
  editData,
  setEditData,
  saveEdit,
  deleteSlice,
  cancelEdit
}) => {
  return (
    <div className="collapsible-container slice-management">
      <div
        onClick={() => setShowSliceManagement((prev) => !prev)}
        className="collapsible-header"
      >
        {showSliceManagement ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        Slice Management
      </div>

      {showSliceManagement && (
        <div className="collapsible-content">
          {/* Choose slice and Add slice controls */}
          <div className="slice-controls d-flex justify-content-around">
            <label>
              Choose Slice:&nbsp;
              <select
                value={selectedLabel}
                onChange={(e) => handleSelectSlice(e.target.value)}
                className="select-input"
              >
                <option value="">-- Select slice --</option>
                {slices.map((slice) => (
                  <option key={slice.label} value={slice.label}>
                    {slice.label}
                  </option>
                ))}
              </select>
            </label>

            <button
              onClick={handleAddClick}
              className="btn add-slice-btn"
              title="Add New Slice"
            >
              + Add Slice
            </button>
          </div>

          {/* Slice editor */}
          {(isAdding || selectedLabel) && (
            <div className="slice-editor">
              <h4>{isAdding ? 'Add New Slice' : 'Edit Slice'}</h4>

              <label className="block-label">
                Label:&nbsp;
                <input
                  type="text"
                  value={editData.label}
                  onChange={(e) => setEditData({ ...editData, label: e.target.value })}
                  className="text-input"
                />
              </label>

              <label className="block-label">
                Value:&nbsp;
                <input
                  type="number"
                  min="0"
                  value={editData.value}
                  onChange={(e) => setEditData({ ...editData, value: e.target.value })}
                  className="text-input"
                />
              </label>

              <label className="block-label">
                Image URL:&nbsp;
                <input
                  type="text"
                  value={editData.imageURL}
                  onChange={(e) => setEditData({ ...editData, imageURL: e.target.value, localImage: null })}
                  placeholder="Enter image URL"
                  className="text-input"
                />
              </label>

              <label className="block-label">
                Or Upload Image:&nbsp;
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setEditData({ ...editData, localImage: file, imageURL: '' });
                    }
                  }}
                  className="file-input"
                />
              </label>

              <label className="block-label">
                Color:&nbsp;
                <input
                  type="color"
                  value={editData.color}
                  onChange={(e) => setEditData({ ...editData, color: e.target.value })}
                  className="color-input"
                />
              </label>

              <div className="btn-group">
                <button onClick={saveEdit} className="btn save-btn">
                  {isAdding ? 'Add' : 'Save'}
                </button>

                {!isAdding && (
                  <button onClick={deleteSlice} className="btn delete-btn">
                    Delete
                  </button>
                )}

                <button onClick={cancelEdit} className="btn cancel-btn">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SliceManagement;