/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React, {useState} from "react";
import useAuth from "../../context/AuthContext";
import useLang from "../../context/LangContext";
import useDataHandler from "../../context/DataHandlerContext";
import useMessage from "../../context/MessageContext";
import useHelp from "../../context/HelpContext";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import PropTypes from "prop-types";
import {
    INFO,
    ERROR,
    DEFAULT_ERROR_TITLE} from "../../utils/helper";
import {
    loadTableAccess,
    isApiSuccess,
    isApiError} from "../../utils/apiHelper";

const TableAccess = (props) => {
    const {config} = props;
    const {authData, setAuthData} = useAuth();
    const {getText} = useLang();
    const {showHelp} = useHelp();
    const {datasources, setDatasources, databaseTypes} = useDataHandler();
    const {messageInfo, showMessage, hideMessage} = useMessage();
    const [tableAccess, setTableAccess] = useState([]);
    const getDatasourceName = () => {
        if (config && config.datasource) {
            return config.datasource.datasourceName;
        } else {
            return "";
        }
    };
        
    const loadTableInfo = async () => {
        showMessage(INFO, getText("Loading table access", "..."), null, true);
        
        let res = await loadTableAccess(config.datasource);
        
        if (isApiError(res)) {
            showMessage(ERROR, res.message);
        } else {
            hideMessage();
        }
          
        setTableAccess(res.result);
    };

    const onHide = () => {
        if (config && config.hideTableAccess) {
            config.hideTableAccess();
        }
    };
    
    return (
        <div className="static-modal">
            <Modal animation={false} 
                   dialogClassName="table-access"
                   show={config.show} 
                   onShow={loadTableInfo}
                   backdrop={true} 
                   keyboard={true}>
                <Modal.Header onHide={onHide}>
                    <Modal.Title>{getText("Table Access", " - ") + getDatasourceName() }</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>this is a test</div>
                </Modal.Body>
                <Modal.Footer>
                    <Button size="sm" onClick={() => onHide() }>{getText("Cancel")}</Button>
                    <Button size="sm" variant="primary" type="submit" onClick={() => config.saveTableAccess()}>{getText("Save")}</Button>
                </Modal.Footer>
            </Modal>
        </div>
        );
};
 
 TableAccess.propTypes = {
    config: PropTypes.object.isRequired
};

 
 export default TableAccess;
