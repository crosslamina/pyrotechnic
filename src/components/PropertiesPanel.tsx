import React from 'react';
import type { CanvasObject, ToolType, Document } from '../types';

interface PropertiesPanelProps {
  selectedObject: CanvasObject | null;
  selectedObjectIds: string[];
  activeTool: ToolType;
  updateSelectedObject: (props: Partial<CanvasObject>) => void;
  brushSettings: { size: number; hardness: number; opacity: number; color: string };
  setBrushSettings: React.Dispatch<React.SetStateAction<{ size: number; hardness: number; opacity: number; color: string }>>;
  eraserSettings: { size: number; opacity: number };
  setEraserSettings: React.Dispatch<React.SetStateAction<{ size: number; opacity: number }>>;
  document: Document;
  updateDocumentSize: (w: number, h: number) => void;
  onCreateSliceFromSelection: () => void;
  onAlign: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  onDistribute: (direction: 'horizontal' | 'vertical') => void;
  onMatchSize: (dimension: 'width' | 'height') => void;
  onUpdateMultipleObjects: (props: Partial<CanvasObject>) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedObject,
  selectedObjectIds,
  activeTool,
  updateSelectedObject,
  brushSettings,
  setBrushSettings,
  eraserSettings,
  setEraserSettings,
  document: doc,
  updateDocumentSize,
  onCreateSliceFromSelection,
  onAlign,
  onDistribute,
  onMatchSize,
  onUpdateMultipleObjects
}) => {
  const activePage = doc.pages.find(p => p.id === doc.currentPageId);

  const renderCard = (title: string, content: React.ReactNode, style?: React.CSSProperties) => (
    <div className="property-card" style={style}>
      <div className="property-card-title">{title}</div>
      <div className="property-card-content">{content}</div>
    </div>
  );

  // Render content depending on selection and active tool
  const renderProperties = () => {
    if (selectedObjectIds.length > 1) {
      const page = doc.pages.find(p => p.id === doc.currentPageId);
      const state = page?.states.find(s => s.id === doc.currentStateId);
      const allObjects = state ? state.layers.flatMap(l => l.objects) : [];
      const selectedObjects = allObjects.filter(o => selectedObjectIds.includes(o.id));

      const getObjX = (obj: any) => Math.round('x' in obj ? obj.x : 'cx' in obj ? obj.cx - obj.rx : 'x1' in obj ? Math.min(obj.x1, obj.x2) : 0);
      const getObjY = (obj: any) => Math.round('y' in obj ? obj.y : 'cy' in obj ? obj.cy - obj.ry : 'y1' in obj ? Math.min(obj.y1, obj.y2) : 0);
      const getObjW = (obj: any) => Math.round('width' in obj ? obj.width : 'rx' in obj ? obj.rx * 2 : 'x1' in obj ? Math.abs(obj.x2 - obj.x1) : 0);
      const getObjH = (obj: any) => Math.round('height' in obj ? obj.height : 'ry' in obj ? obj.ry * 2 : 'y1' in obj ? Math.abs(obj.y2 - obj.y1) : 0);

      const firstObj = selectedObjects[0];
      const isSameX = selectedObjects.length > 0 && selectedObjects.every(o => getObjX(o) === getObjX(firstObj));
      const isSameY = selectedObjects.length > 0 && selectedObjects.every(o => getObjY(o) === getObjY(firstObj));
      const isSameW = selectedObjects.length > 0 && selectedObjects.every(o => getObjW(o) === getObjW(firstObj));
      const isSameH = selectedObjects.length > 0 && selectedObjects.every(o => getObjH(o) === getObjH(firstObj));

      const commonX = isSameX ? getObjX(firstObj) : '';
      const commonY = isSameY ? getObjY(firstObj) : '';
      const commonW = isSameW ? getObjW(firstObj) : '';
      const commonH = isSameH ? getObjH(firstObj) : '';

      return (
        <div className="properties-body">
          {renderCard(
            `Selection`,
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-gold)' }}>
                {selectedObjectIds.length} Items
              </span>
              <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>
                Selected
              </span>
            </div>
          )}

          {renderCard(
            "Align Objects",
            <div className="grid-3x2">
              <button className="btn-mini" onClick={() => onAlign('left')} title="Align Left">L</button>
              <button className="btn-mini" onClick={() => onAlign('center')} title="Align Center">C</button>
              <button className="btn-mini" onClick={() => onAlign('right')} title="Align Right">R</button>
              <button className="btn-mini" onClick={() => onAlign('top')} title="Align Top">T</button>
              <button className="btn-mini" onClick={() => onAlign('middle')} title="Align Middle">M</button>
              <button className="btn-mini" onClick={() => onAlign('bottom')} title="Align Bottom">B</button>
            </div>
          )}

          {renderCard(
            "Transform",
            <div className="grid-2x2">
              <div className="input-pair">
                <span className="input-pair-label">X</span>
                <input
                  type="number"
                  placeholder={isSameX ? "" : "Mixed"}
                  className="control-input"
                  value={commonX}
                  onChange={(e) => onUpdateMultipleObjects({ x: Number(e.target.value) })}
                />
              </div>
              <div className="input-pair">
                <span className="input-pair-label">Y</span>
                <input
                  type="number"
                  placeholder={isSameY ? "" : "Mixed"}
                  className="control-input"
                  value={commonY}
                  onChange={(e) => onUpdateMultipleObjects({ y: Number(e.target.value) })}
                />
              </div>
              <div className="input-pair">
                <span className="input-pair-label">W</span>
                <input
                  type="number"
                  placeholder={isSameW ? "" : "Mixed"}
                  className="control-input"
                  value={commonW}
                  onChange={(e) => onUpdateMultipleObjects({ width: Math.max(1, Number(e.target.value)) })}
                />
              </div>
              <div className="input-pair">
                <span className="input-pair-label">H</span>
                <input
                  type="number"
                  placeholder={isSameH ? "" : "Mixed"}
                  className="control-input"
                  value={commonH}
                  onChange={(e) => onUpdateMultipleObjects({ height: Math.max(1, Number(e.target.value)) })}
                />
              </div>
            </div>
          )}

          {renderCard(
            "Match Size",
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button className="btn-secondary" style={{ padding: '2px 8px', fontSize: '10px', height: '20px' }} onClick={() => onMatchSize('width')} title="Match width of first selected object">Match W</button>
              <button className="btn-secondary" style={{ padding: '2px 8px', fontSize: '10px', height: '20px' }} onClick={() => onMatchSize('height')} title="Match height of first selected object">Match H</button>
            </div>
          )}

          {selectedObjectIds.length >= 3 && renderCard(
            "Distribute",
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button className="btn-secondary" style={{ padding: '2px 8px', fontSize: '10px', height: '20px' }} onClick={() => onDistribute('horizontal')} title="Distribute horizontal spacing">Dist H</button>
              <button className="btn-secondary" style={{ padding: '2px 8px', fontSize: '10px', height: '20px' }} onClick={() => onDistribute('vertical')} title="Distribute vertical spacing">Dist V</button>
            </div>
          )}

          {renderCard(
            "Actions",
            <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <button
                className="btn-secondary"
                style={{
                  padding: '4px 12px',
                  fontSize: '11px',
                  borderColor: 'var(--accent-green)',
                  color: 'var(--accent-green)',
                  height: '24px'
                }}
                onClick={onCreateSliceFromSelection}
                title="Create a slice wrapping all selected objects"
              >
                Insert Slice
              </button>
            </div>,
            { marginLeft: 'auto' }
          )}
        </div>
      );
    }

    if (selectedObject) {
      const obj = selectedObject;

      const getSingleX = () => Math.round('x' in obj ? obj.x : 'cx' in obj ? obj.cx - obj.rx : 'x1' in obj ? Math.min(obj.x1, obj.x2) : 0);
      const getSingleY = () => Math.round('y' in obj ? obj.y : 'cy' in obj ? obj.cy - obj.ry : 'y1' in obj ? Math.min(obj.y1, obj.y2) : 0);
      const getSingleW = () => Math.round('width' in obj ? obj.width : 'rx' in obj ? obj.rx * 2 : 'x1' in obj ? Math.abs(obj.x2 - obj.x1) : 0);
      const getSingleH = () => Math.round('height' in obj ? obj.height : 'ry' in obj ? obj.ry * 2 : 'y1' in obj ? Math.abs(obj.y2 - obj.y1) : 0);

      const renderAlignCard = () => renderCard(
        "Align Canvas",
        <div className="grid-3x2">
          <button className="btn-mini" onClick={() => onAlign('left')} title="Align Left">L</button>
          <button className="btn-mini" onClick={() => onAlign('center')} title="Align Center">C</button>
          <button className="btn-mini" onClick={() => onAlign('right')} title="Align Right">R</button>
          <button className="btn-mini" onClick={() => onAlign('top')} title="Align Top">T</button>
          <button className="btn-mini" onClick={() => onAlign('middle')} title="Align Middle">M</button>
          <button className="btn-mini" onClick={() => onAlign('bottom')} title="Align Bottom">B</button>
        </div>
      );

      const renderTransformCard = (showWH = true) => renderCard(
        "Transform",
        <div className="grid-2x2">
          <div className="input-pair">
            <span className="input-pair-label">X</span>
            <input
              type="number"
              className="control-input"
              value={getSingleX()}
              onChange={(e) => {
                const val = Number(e.target.value);
                if ('x' in obj) updateSelectedObject({ x: val });
                else if ('cx' in obj) updateSelectedObject({ cx: val + obj.rx });
                else if ('x1' in obj) {
                  const dx = val - Math.min(obj.x1, obj.x2);
                  updateSelectedObject({ x1: obj.x1 + dx, x2: obj.x2 + dx });
                }
              }}
            />
          </div>
          <div className="input-pair">
            <span className="input-pair-label">Y</span>
            <input
              type="number"
              className="control-input"
              value={getSingleY()}
              onChange={(e) => {
                const val = Number(e.target.value);
                if ('y' in obj) updateSelectedObject({ y: val });
                else if ('cy' in obj) updateSelectedObject({ cy: val + obj.ry });
                else if ('y1' in obj) {
                  const dx = val - Math.min(obj.y1, obj.y2);
                  updateSelectedObject({ y1: obj.y1 + dx, y2: obj.y2 + dx });
                }
              }}
            />
          </div>
          {showWH ? (
            <>
              <div className="input-pair">
                <span className="input-pair-label">W</span>
                <input
                  type="number"
                  className="control-input"
                  value={getSingleW()}
                  onChange={(e) => {
                    const val = Math.max(1, Number(e.target.value));
                    if ('width' in obj) updateSelectedObject({ width: val });
                    else if ('rx' in obj) updateSelectedObject({ rx: val / 2 });
                  }}
                />
              </div>
              <div className="input-pair">
                <span className="input-pair-label">H</span>
                <input
                  type="number"
                  className="control-input"
                  value={getSingleH()}
                  onChange={(e) => {
                    const val = Math.max(1, Number(e.target.value));
                    if ('height' in obj) updateSelectedObject({ height: val });
                    else if ('ry' in obj) updateSelectedObject({ ry: val / 2 });
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <div style={{ width: '66px' }} />
              <div style={{ width: '66px' }} />
            </>
          )}
        </div>
      );

      const renderAppearanceCard = () => renderCard(
        "Appearance",
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '160px' }}>
          {'opacity' in obj && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)', width: '65px' }}>Opacity ({obj.opacity}%)</span>
              <input
                type="range"
                min="0"
                max="100"
                style={{ width: '80px', height: '12px' }}
                value={obj.opacity}
                onChange={(e) => updateSelectedObject({ opacity: Number(e.target.value) })}
              />
            </div>
          )}
          {'blendMode' in obj && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)', width: '65px' }}>Blend Mode</span>
              <select
                className="control-select"
                style={{ height: '18px', padding: '0 4px', fontSize: '10px', width: '90px' }}
                value={obj.blendMode}
                onChange={(e) => updateSelectedObject({ blendMode: e.target.value })}
              >
                <option value="source-over">Normal</option>
                <option value="multiply">Multiply</option>
                <option value="screen">Screen</option>
                <option value="overlay">Overlay</option>
                <option value="darken">Darken</option>
                <option value="lighten">Lighten</option>
                <option value="color-dodge">Color Dodge</option>
                <option value="color-burn">Color Burn</option>
                <option value="difference">Difference</option>
                <option value="hue">Hue</option>
                <option value="saturation">Saturation</option>
                <option value="color">Color</option>
                <option value="luminosity">Luminosity</option>
              </select>
            </div>
          )}
        </div>
      );

      const renderActionsCard = () => (
        obj.type !== 'slice' && renderCard(
          "Actions",
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <button
              className="btn-secondary"
              style={{
                padding: '4px 12px',
                fontSize: '11px',
                borderColor: 'var(--accent-green)',
                color: 'var(--accent-green)',
                height: '24px'
              }}
              onClick={onCreateSliceFromSelection}
              title="Create a slice wrapping this object"
            >
              Insert Slice
            </button>
          </div>,
          { marginLeft: 'auto' }
        )
      );

      // Render details according to object types
      switch (obj.type) {
        case 'rect':
        case 'ellipse':
        case 'line':
        case 'path':
          return (
            <div className="properties-body">
              {renderAlignCard()}
              {renderTransformCard(obj.type !== 'path')}

              {renderCard(
                "Fill & Stroke",
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '150px' }}>
                  {'fill' in obj && obj.fill !== undefined && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)', width: '32px' }}>Fill</span>
                      <button
                        className={`btn-mini ${obj.fill === 'none' ? 'active' : ''}`}
                        style={{ width: '42px', height: '18px', fontSize: '9px' }}
                        onClick={() => updateSelectedObject({ fill: obj.fill === 'none' ? '#3b82f6' : 'none' })}
                      >
                        {obj.fill === 'none' ? 'Solid' : 'None'}
                      </button>
                      {obj.fill !== 'none' && (
                        <div className="color-picker-wrapper" style={{ padding: '0 4px', height: '18px' }}>
                          <div className="color-preview" style={{ backgroundColor: obj.fill, width: '12px', height: '12px' }} />
                          <input
                            type="color"
                            className="color-input-hidden"
                            value={obj.fill.startsWith('#') && obj.fill.length === 7 ? obj.fill : '#3b82f6'}
                            onChange={(e) => updateSelectedObject({ fill: e.target.value })}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {'stroke' in obj && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)', width: '32px' }}>Stroke</span>
                      <div className="color-picker-wrapper" style={{ padding: '0 4px', height: '18px' }}>
                        <div className="color-preview" style={{ backgroundColor: obj.stroke, width: '12px', height: '12px' }} />
                        <input
                          type="color"
                          className="color-input-hidden"
                          value={obj.stroke.startsWith('#') && obj.stroke.length === 7 ? obj.stroke : '#000000'}
                          onChange={(e) => updateSelectedObject({ stroke: e.target.value })}
                        />
                      </div>
                      <input
                        type="number"
                        className="control-input"
                        style={{ width: '38px', height: '18px', padding: '0 4px', fontSize: '10px' }}
                        min="0"
                        max="50"
                        value={obj.strokeWidth}
                        onChange={(e) => updateSelectedObject({ strokeWidth: Math.max(0, Number(e.target.value)) })}
                      />
                      {obj.type === 'line' && (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '1px', cursor: 'pointer', fontSize: '9px', fontWeight: 600 }}>
                            <input
                              type="checkbox"
                              checked={!!(obj as any).arrowStart}
                              onChange={(e) => updateSelectedObject({ arrowStart: e.target.checked })}
                            />
                            Start
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '1px', cursor: 'pointer', fontSize: '9px', fontWeight: 600 }}>
                            <input
                              type="checkbox"
                              checked={!!(obj as any).arrowEnd}
                              onChange={(e) => updateSelectedObject({ arrowEnd: e.target.checked })}
                            />
                            End
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {renderAppearanceCard()}

              {renderCard(
                "Effects",
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '150px' }}>
                  {obj.type === 'rect' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)', width: '60px' }}>Radius ({obj.rx}px)</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        style={{ width: '80px', height: '12px' }}
                        value={obj.rx}
                        onChange={(e) => updateSelectedObject({ rx: Number(e.target.value) })}
                      />
                    </div>
                  )}
                  {'shadowBlur' in obj && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)', width: '60px' }}>Shadow</span>
                      <input
                        type="color"
                        style={{ width: '18px', height: '18px', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}
                        value={obj.shadowColor.startsWith('#') ? obj.shadowColor : '#000000'}
                        onChange={(e) => updateSelectedObject({ shadowColor: e.target.value })}
                      />
                      <div style={{ display: 'flex', gap: '2px' }}>
                        <input
                          type="number"
                          placeholder="B"
                          className="control-input"
                          style={{ width: '24px', height: '18px', fontSize: '9px', padding: '0 2px' }}
                          min="0"
                          value={obj.shadowBlur}
                          onChange={(e) => updateSelectedObject({ shadowBlur: Math.max(0, Number(e.target.value)) })}
                          title="Blur"
                        />
                        <input
                          type="number"
                          placeholder="X"
                          className="control-input"
                          style={{ width: '24px', height: '18px', fontSize: '9px', padding: '0 2px' }}
                          value={obj.shadowOffsetX}
                          onChange={(e) => updateSelectedObject({ shadowOffsetX: Number(e.target.value) })}
                          title="Offset X"
                        />
                        <input
                          type="number"
                          placeholder="Y"
                          className="control-input"
                          style={{ width: '24px', height: '18px', fontSize: '9px', padding: '0 2px' }}
                          value={obj.shadowOffsetY}
                          onChange={(e) => updateSelectedObject({ shadowOffsetY: Number(e.target.value) })}
                          title="Offset Y"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {renderActionsCard()}
            </div>
          );

        case 'text':
          return (
            <div className="properties-body">
              {renderAlignCard()}
              {renderTransformCard()}

              {renderCard(
                "Typography",
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '180px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <select
                      className="control-select"
                      style={{ height: '18px', padding: '0 4px', fontSize: '10px', width: '90px' }}
                      value={obj.fontFamily}
                      onChange={(e) => updateSelectedObject({ fontFamily: e.target.value })}
                    >
                      <option value="Outfit">Outfit</option>
                      <option value="Inter">Inter</option>
                      <option value="sans-serif">Sans-Serif</option>
                      <option value="serif">Serif</option>
                      <option value="monospace">Monospace</option>
                      <option value="JetBrains Mono">JetBrains Mono</option>
                    </select>
                    <input
                      type="number"
                      className="control-input"
                      style={{ width: '38px', height: '18px', padding: '0 4px', fontSize: '10px' }}
                      min="8"
                      max="150"
                      value={obj.fontSize}
                      onChange={(e) => updateSelectedObject({ fontSize: Math.max(8, Number(e.target.value)) })}
                      title="Font Size"
                    />
                    <div className="color-picker-wrapper" style={{ padding: '0 4px', height: '18px' }}>
                      <div className="color-preview" style={{ backgroundColor: obj.fill, width: '12px', height: '12px' }} />
                      <input
                        type="color"
                        className="color-input-hidden"
                        value={obj.fill}
                        onChange={(e) => updateSelectedObject({ fill: e.target.value })}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      <button
                        className={`btn-mini ${obj.fontWeight === 'bold' ? 'active' : ''}`}
                        style={{ width: '22px', height: '18px', fontWeight: 'bold' }}
                        onClick={() => updateSelectedObject({ fontWeight: obj.fontWeight === 'bold' ? 'normal' : 'bold' })}
                      >
                        B
                      </button>
                      <button
                        className={`btn-mini ${obj.fontStyle === 'italic' ? 'active' : ''}`}
                        style={{ width: '22px', height: '18px', fontStyle: 'italic' }}
                        onClick={() => updateSelectedObject({ fontStyle: obj.fontStyle === 'italic' ? 'normal' : 'italic' })}
                      >
                        I
                      </button>
                    </div>
                    <select
                      className="control-select"
                      style={{ height: '18px', padding: '0 4px', fontSize: '10px', width: '70px' }}
                      value={obj.textAlign}
                      onChange={(e) => updateSelectedObject({ textAlign: e.target.value as any })}
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>
              )}

              {renderAppearanceCard()}
              {renderActionsCard()}
            </div>
          );

        case 'bitmap':
          return (
            <div className="properties-body">
              {renderAlignCard()}
              {renderTransformCard(true)}

              {renderCard(
                "Filters",
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '150px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '9px', color: 'var(--text-secondary)', width: '60px' }}>Blur ({obj.filters.blur}px)</span>
                    <input
                      type="range"
                      min="0"
                      max="15"
                      style={{ width: '70px', height: '12px' }}
                      value={obj.filters.blur}
                      onChange={(e) => updateSelectedObject({ 
                        filters: { ...obj.filters, blur: Number(e.target.value) } 
                      })}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '9px', color: 'var(--text-secondary)', width: '60px' }}>Bright ({obj.filters.brightness}%)</span>
                    <input
                      type="range"
                      min="50"
                      max="180"
                      style={{ width: '70px', height: '12px' }}
                      value={obj.filters.brightness}
                      onChange={(e) => updateSelectedObject({ 
                        filters: { ...obj.filters, brightness: Number(e.target.value) } 
                      })}
                    />
                  </div>
                </div>
              )}

              {renderCard(
                "Effects",
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '160px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      className={`btn-mini ${obj.filters.grayscale > 0 ? 'active' : ''}`}
                      style={{ height: '18px', fontSize: '9px' }}
                      onClick={() => updateSelectedObject({
                        filters: { ...obj.filters, grayscale: obj.filters.grayscale > 0 ? 0 : 100 }
                      })}
                    >
                      Grayscale
                    </button>
                    <button
                      className={`btn-mini ${obj.filters.sepia > 0 ? 'active' : ''}`}
                      style={{ height: '18px', fontSize: '9px' }}
                      onClick={() => updateSelectedObject({
                        filters: { ...obj.filters, sepia: obj.filters.sepia > 0 ? 0 : 100 }
                      })}
                    >
                      Sepia
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '9px', color: 'var(--text-secondary)', width: '60px' }}>Contrast ({obj.filters.contrast}%)</span>
                    <input
                      type="range"
                      min="50"
                      max="180"
                      style={{ width: '70px', height: '12px' }}
                      value={obj.filters.contrast}
                      onChange={(e) => updateSelectedObject({ 
                        filters: { ...obj.filters, contrast: Number(e.target.value) } 
                      })}
                    />
                  </div>
                </div>
              )}

              {renderAppearanceCard()}
              {renderActionsCard()}
            </div>
          );

        case 'slice':
          return (
            <div className="properties-body">
              {renderAlignCard()}
              {renderTransformCard()}

              {renderCard(
                "Slice Settings",
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '220px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', width: '60px' }}>Name</span>
                    <input
                      type="text"
                      className="control-input long"
                      style={{ width: '120px', height: '20px', fontSize: '11px' }}
                      value={obj.name}
                      onChange={(e) => updateSelectedObject({ name: e.target.value.replace(/[^a-zA-Z0-9_-]/g, '') })}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', width: '60px' }}>Format</span>
                    <select
                      className="control-select"
                      style={{ height: '20px', padding: '0 4px', fontSize: '10px', width: '80px' }}
                      value={obj.format}
                      onChange={(e) => updateSelectedObject({ format: e.target.value as any })}
                    >
                      <option value="png">PNG (Lossless)</option>
                      <option value="jpeg">JPEG (Photo)</option>
                      <option value="svg">SVG (Vector)</option>
                    </select>
                    {obj.format === 'jpeg' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>Qual ({obj.quality}%)</span>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          style={{ width: '50px', height: '12px' }}
                          value={obj.quality}
                          onChange={(e) => updateSelectedObject({ quality: Number(e.target.value) })}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
      }
    }

    // Paint settings if tool is paint-based
    if (activeTool === 'brush') {
      return (
        <div className="properties-body">
          {renderCard(
            "Brush Settings",
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, auto)', gap: '6px 16px', minWidth: '320px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '9px', color: 'var(--text-secondary)', width: '65px' }}>Size ({brushSettings.size}px)</span>
                <input
                  type="range"
                  min="1"
                  max="80"
                  style={{ width: '80px', height: '12px' }}
                  value={brushSettings.size}
                  onChange={(e) => setBrushSettings({ ...brushSettings, size: Number(e.target.value) })}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '9px', color: 'var(--text-secondary)', width: '70px' }}>Hardness ({brushSettings.hardness}%)</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  style={{ width: '80px', height: '12px' }}
                  value={brushSettings.hardness}
                  onChange={(e) => setBrushSettings({ ...brushSettings, hardness: Number(e.target.value) })}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '9px', color: 'var(--text-secondary)', width: '65px' }}>Opacity ({brushSettings.opacity}%)</span>
                <input
                  type="range"
                  min="1"
                  max="100"
                  style={{ width: '80px', height: '12px' }}
                  value={brushSettings.opacity}
                  onChange={(e) => setBrushSettings({ ...brushSettings, opacity: Number(e.target.value) })}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '9px', color: 'var(--text-secondary)', width: '70px' }}>Color</span>
                <div className="color-picker-wrapper" style={{ padding: '0 4px', height: '18px' }}>
                  <div className="color-preview" style={{ backgroundColor: brushSettings.color, width: '12px', height: '12px' }} />
                  <input
                    type="color"
                    className="color-input-hidden"
                    value={brushSettings.color}
                    onChange={(e) => setBrushSettings({ ...brushSettings, color: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (activeTool === 'eraser') {
      return (
        <div className="properties-body">
          {renderCard(
            "Eraser Settings",
            <div style={{ display: 'flex', gap: '16px', minWidth: '320px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '9px', color: 'var(--text-secondary)', width: '70px' }}>Size ({eraserSettings.size}px)</span>
                <input
                  type="range"
                  min="1"
                  max="100"
                  style={{ width: '80px', height: '12px' }}
                  value={eraserSettings.size}
                  onChange={(e) => setEraserSettings({ ...eraserSettings, size: Number(e.target.value) })}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '9px', color: 'var(--text-secondary)', width: '85px' }}>Opacity ({eraserSettings.opacity}%)</span>
                <input
                  type="range"
                  min="1"
                  max="100"
                  style={{ width: '80px', height: '12px' }}
                  value={eraserSettings.opacity}
                  onChange={(e) => setEraserSettings({ ...eraserSettings, opacity: Number(e.target.value) })}
                />
              </div>
            </div>
          )}
        </div>
      );
    }

    // Default document parameters (when nothing selected and drawing tools inactive)
    return (
      <div className="properties-body">
        {renderCard(
          "Document Info",
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Name</span>
            <input
              type="text"
              className="control-input long"
              style={{ width: '120px', height: '20px', fontSize: '11px' }}
              disabled
              value={doc.name}
            />
          </div>
        )}

        {activePage && renderCard(
          "Canvas Size",
          <div className="grid-2x2">
            <div className="input-pair">
              <span className="input-pair-label" style={{ width: '32px' }}>Width</span>
              <input
                type="number"
                className="control-input"
                min="100"
                max="5000"
                value={activePage.width}
                onChange={(e) => updateDocumentSize(Math.max(100, Number(e.target.value)), activePage.height)}
              />
            </div>
            <div className="input-pair">
              <span className="input-pair-label" style={{ width: '32px' }}>Height</span>
              <input
                type="number"
                className="control-input"
                min="100"
                max="5000"
                value={activePage.height}
                onChange={(e) => updateDocumentSize(activePage.width, Math.max(100, Number(e.target.value)))}
              />
            </div>
          </div>
        )}

        {renderCard(
          "Workspace Tips",
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', justifyContent: 'center' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>• Delete: Remove selected objects</span>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>• Space + Drag / Middle Click: Scroll Canvas</span>
          </div>,
          { marginLeft: 'auto', border: 'none', background: 'transparent' }
        )}
      </div>
    );
  };

  return (
    <div className="properties-inspector">
      <div className="properties-header">Properties Inspector</div>
      {renderProperties()}
    </div>
  );
};


