import React, { useState } from 'react';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button"
import useMessage from "../context/MessageContext";
import useAuth from "../context/AuthContext";
import useLang from "../context/LangContext";
import TextEntry from "./TextEntry";
import PropTypes from "prop-types";
import {
    replaceTokens, 
    DEFAULT_DOCUMENT_GROUP, 
    MODAL_TITLE_SIZE,
    isValidFilenameKey,
    isEmpty,
    UNARY_COMPARISON_OPERATORS,
    getParameterTypeFromId,
    copyObject,
    getFilterComparisonInput} from "../utils/helper";


const ParameterEntryModal2 = (props) => {
    const {config} = props;
    const {getText} = useLang();
    const {messageInfo, showMessage, hideMessage, setMessageInfo} = useMessage();
    const [parameters, setParameters] = useState(null);
    
    const getTitle = () => {
        return getText("Run Report");
    };
    
    const onHide = () => {
        config.hide();
    };
    
    const canRun = () => {
        if (!parameters) {
            return false;
        } else {
            for (let i = 0; i < parameters.length; ++i) {
                if (isEmpty(parameters[i])) {
                    return false;
                }
            }
        }
        
        return true;
    };

    const getRequiredEntryFields = () => {
        let retval = [];
        for (let i = 0; i < config.filterColumns.length; ++i) {
            if (!UNARY_COMPARISON_OPERATORS.includes(config.filterColumns[i].comparisonOperator) 
                    && isEmpty(config.filterColumns[i].comparisonValue)) {
                retval.push(config.filterColumns[i]);
            }
        }
        return retval;
    };
    
    const getLabel = (filter) => {
         return <div className="label">{filter.displayName + " " + filter.comparisonOperator}</div>;
    };
    
    const onChange = (e) => {
        let indx = Number(e.target.id.replace("f-", ""));
        
        let params = copyObject(parameters);
        params[indx] = e.target.value;
        
        setParameters(params);
    };
    
    const getParameterInputFields = () => {
        if (config && config.filterColumns) {
            let entryFields = getRequiredEntryFields();
            return entryFields.map((f, indx) => { 
                return <div className="entrygrid-225-225">
                    <div className="label">{getLabel(f)}</div><div>{getFilterComparisonInput(f, indx, onChange)}</div>
                </div>;
            });
        } else {
            return "";
        }
    };
    
    const runReport = () => {
        let params = [];
        for (let i = 0; i < parameters.length; ++i) {
            params.push(parameters[i]);
        }
        
        config.runReport(params);
    };
    
    const onShow = () => {
        let entryFields = getRequiredEntryFields();
        let params = [];
        for (let i = 0; i < entryFields.length; ++i) {
          params.push("");
        }
        
         setParameters(params);
    };
    
    return (
            <div className="static-modal">
                <Modal animation={false} 
                       show={config.show} 
                       onHide={onHide}
                       onShow={onShow}>
                    <Modal.Header closeButton>
                        <Modal.Title as={MODAL_TITLE_SIZE}>{getTitle()}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div>
                            { getParameterInputFields()}
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button size="sm" onClick={() => onHide() }>{getText("Cancel")}</Button>
                        <Button size="sm" variant="primary" disabled={!canRun()}  type="submit" onClick={() => runReport()}>{getText("Run")}</Button>
                    </Modal.Footer>
                </Modal>
            </div>
            );
};

ParameterEntryModal2.propTypes = {
    config: PropTypes.object.isRequired
};

export default ParameterEntryModal2;
