/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import useAuth from "../../context/AuthContext";
import useLang from "../../context/LangContext";
import useDataHandler from "../../context/DataHandlerContext";
import useMessage from "../../context/MessageContext";
import useHelp from "../../context/HelpContext";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button"

const TableAccess = (props) => {
    const {config} = props;
    const {authData, setAuthData} = useAuth();
    const {getText} = useLang();
    const {showHelp} = useHelp();
    const {datasources, setDatasources, databaseTypes} = useDataHandler();
    const {datasource} = props;
    return (
            <div className="static-modal">
                <Modal animation={false} 
                       size={config.dlgsize ? config.dlgsize : ""}
                       show={config.show} 
                       backdrop={true} 
                       keyboard={true}>
                    <Modal.Header>
                        <Modal.Title>{getText("Table Access")}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div>this is a test</div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button size="sm" onClick={() => config.hideTableAccess() }>{getText("Cancel")}</Button>
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
