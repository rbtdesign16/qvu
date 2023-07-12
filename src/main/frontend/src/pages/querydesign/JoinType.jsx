/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React, {useState} from "react";
import PropTypes from "prop-types";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button"
import useLang from "../../context/LangContext";
import {MODAL_TITLE_SIZE} from "../../utils/helper";

const JoinType = (props) => {
    const {getText} = useLang();
    const {config} = props;
    const [joinType, setJoinType] = useState(config.joinType ? config.joinType : "outer");

    const isInner = () => {
        return (joinType === "inner");
    };
    
    const onHide = () => {
        if (config && config.hide) {
            config.hide();
        }
    }
    
    return (
            <div className="static-modal">
                <Modal animation={false} 
                       size="sm"
                       show={config.show} 
                       aria-labelledby="contained-modal-title-vcenter"
                       centered
                       onHide={onHide}
                       backdrop={true} 
                       keyboard={true}>
                    <Modal.Header closeButton>
                        <Modal.Title as={MODAL_TITLE_SIZE}>{getText("Join Type")}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div onChange={(e) => setJoinType(e.target.value)}>
                            <input type="radio" name="jointype" checked={!isInner()} value="outer"/>&nbsp;&nbsp;{getText("Outer Join")}<br />
                            <input type="radio" name="jointype" checked={isInner()} value="inner"/>&nbsp;&nbsp;{getText("Inner Join")}
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button size="sm" onClick={() => config.hide()}>Cancel</Button>
                        <Button size="sm" variant="primary" type="submit" onClick={(e) => config.setJoinType(joinType, config.nodeId)}>{getText("Ok")}</Button>
                    </Modal.Footer>
                </Modal>
            </div>
                    );
        };

        JoinType.propTypes = {
            config: PropTypes.object.isRequired
        };

        export default JoinType;