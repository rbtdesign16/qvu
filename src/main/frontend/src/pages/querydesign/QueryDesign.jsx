/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React, { useState } from 'react';
import { Tabs, Tab } from "react-bootstrap";
import useMessage from "../../context/MessageContext";
import {INFO, WARN, ERROR} from "../../utils/helper";
import { Splitter, SplitterPanel } from 'primereact/splitter';
const QueryDesign = () => {
    return (
                <Splitter stateKey={"qdesign"} stateStorage={"local"} guttorSize={8}>
                    <SplitterPanel size={25} className="flex align-items-center justify-content-center">
                        Panel 1
                    </SplitterPanel>
                    <SplitterPanel size={75} className="flex align-items-center justify-content-center">
                        Panel 2
                    </SplitterPanel>
                </Splitter>);

};

export default QueryDesign;
