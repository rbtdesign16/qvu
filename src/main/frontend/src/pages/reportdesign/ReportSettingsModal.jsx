import React, { useState } from 'react';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button"
import useLang from "../../context/LangContext";
import NumberEntry from "../../widgets/NumberEntry";
import PropTypes from "prop-types";
import {MODAL_TITLE_SIZE} from "../../utils/helper";

const ReportSettingsModal = (props) => {
    const {config} = props;
    const {getText} = useLang();
    const [pageSettings, setPageSettings] = useState({});
    
    const getTitle = () => {
        return getText("Page Settings");
    };
    
    const onHide = () => {
        config.hide();
    };
    
    const loadPageSizes = () => {
        if (config && config.reportSettings) {
            return config.reportSettings.pageSizes.map(ps => {
                if (pageSettings.pageSize === ps) {
                    return <option value={ps} selected>{ps}</option>;
                } else {
                    return <option value={ps}>{ps}</option>;
                }
            });
        } else {
            return "";
        }
    };
    
    const loadPageOrientations = () => {
        if (config && config.reportSettings) {
            return config.reportSettings.pageOrientations.map(o => {
                if (pageSettings.pageOrientation === o) {
                    return <option value={o} selected>{o}</option>;
                } else {
                    return <option value={o}>{o}</option>;
                }
            });
        } else {
            return "";
        }
    };
    
    const loadPageUnits = () => {
        if (config && config.reportSettings) {
            return config.reportSettings.pageUnits.map(u => {
                if (pageSettings.pageUnits === u) {
                    return <option value={u} selected>{u}</option>;
                } else {
                    return <option value={u}>{u}</option>;
                }
            });
        } else {
            return "";
        }
    };

    const onPageSettings = (e) => {
        let ps = {...pageSettings};
        if (e.target.selectedIndex) {
            ps[e.target.name] = e.target.options[e.target.selectedIndex].value;
        } else {
            ps[e.target.name] = e.target.value;
        }
        
        setPageSettings(ps);
    };
    
    const onShow = () => {
        if (config.report) {
            let ps = {
                pageSize: config.report.pageSize,
                pageOrientation: config.report.pageOrientation,
                pageUnits: config.report.pageUnits,
                borderLeft: config.report.pageBorder[0],
                borderTop: config.report.pageBorder[1],
                borderRight: config.report.pageBorder[2],
                borderBottom: config.report.pageBorder[3]
            }
            setPageSettings(ps);
        }
    }

    return (
            <div className="static-modal">
                <Modal animation={false} 
                    size="sm"
                    show={config.show} 
                    onShow={onShow}
                    onHide={onHide}
                    backdrop={true} 
                    keyboard={true}>
                    <Modal.Header closeButton>
                        <Modal.Title as={MODAL_TITLE_SIZE}>{getTitle()}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="entrygrid-125-100">
                            <div className="label">{getText("Size:")}</div><div><select name="pageSize" onChange={e => onPageSettings(e)}>{loadPageSizes()}</select></div>
                            <div className="label">{getText("Orientation:")}</div><div><select name="pageOrientation" onChange={e => onPageSettings(e)}>{loadPageOrientations()}</select></div>
                            <div className="label">{getText("Units:")}</div><div><select name="pageUnits" onChange={e => onPageSettings(e)}>{loadPageUnits()}</select></div>
                            <div className="label">{getText("Border Left:")}</div><div><NumberEntry id="bl" name="borderLeft" defaultValue={pageSettings.borderLeft} min={0} onChange={e => onPageSettings(e)} /></div>
                            <div className="label">{getText("Border Top:")}</div><div><NumberEntry id="bl" name="borderTop" defaultValue={pageSettings.borderTop} min={0} onChange={e => onPageSettings(e)} /></div>
                            <div className="label">{getText("Border Right:")}</div><div><NumberEntry id="br" name="borderRight" defaultValue={pageSettings.borderRight} min={0} onChange={e => onPageSettings(e)} /></div>
                            <div className="label">{getText("Border Bottom:")}</div><div><NumberEntry id="bb" name="borderBottom" defaultValue={pageSettings.borderBottom} min={0} onChange={e => onPageSettings(e)} /></div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button size="sm" onClick={() => onHide() }>{getText("Cancel")}</Button>
                        <Button size="sm" variant="primary" type="submit" onClick={() => config.saveSettings(pageSettings)}>{getText("Save")}</Button>
                    </Modal.Footer>
                </Modal>
            </div>
            );
};

ReportSettingsModal.propTypes = {
    config: PropTypes.object.isRequired,
};

export default ReportSettingsModal;
