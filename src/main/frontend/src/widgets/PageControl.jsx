import React, { useState } from "react";
import useLang from "../context/LangContext";
import NumberEntry from "./NumberEntry";
import PropTypes from "prop-types";
import {AiOutlineStepBackward, AiOutlineStepForward, AiFillCaretLeft, AiFillCaretRight } from "react-icons/ai";
import "../css/query-results.css";
import {
        RESULT_SET_PAGE_SIZES,
        DEFAULT_PAGE_SIZE,
        ARROW_UP_KEY,
        ARROW_DOWN_KEY,
        HOME_KEY,
        END_KEY,
        SMALL_ICON_SIZE
} from "../utils/helper";

const PageControl = (props) => {
    const {dataSet, pagingInfo, setPagingInfo, elapsedTime} = props;
    const {getText} = useLang();
    
     const onPageSize = (e) => {
        e.preventDefault();
        let sz = Number(e.target.options[e.target.selectedIndex].value);
        let pages = Math.max(0, Math.ceil(dataSet.length / sz));
        let el = document.getElementById("rtpc");
        if (el) {
            el.value = 1;
        }
        setPagingInfo({...pagingInfo, pageSize: sz, pageCount: pages, currentPage: 1});
    };

    const getPageSizes = () => {
        return RESULT_SET_PAGE_SIZES.map(s => {
            if (s === pagingInfo.pageSize) {
                return <option value={s} selected>{s}</option>;
            } else {
                return <option value={s}>{s}</option>;
            }
        });
    };

    const onPage = (e) => {
       let pg = e.target.value;
       
       if ((pg > 0) && (pg <= pagingInfo.pageCount)) {
           setPagingInfo({...pagingInfo, currentPage: pg});;
       }
    };
    
    const onHome = () => {
        setPagingInfo({...pagingInfo, currentPage: 1});
        let el = document.getElementById("rtpc");

        if (el) {
            el.value = 1;
        }
    };
    
    const onEnd = () => {
        setPagingInfo({...pagingInfo, currentPage: pagingInfo.pageCount});
        let el = document.getElementById("rtpc");

        if (el) {
            el.value = pagingInfo.pageCount;
        }
    };
    
    const onPageDown = () => {
        if (pagingInfo.currentPage < pagingInfo.pageCount) {
            let pc = pagingInfo.currentPage + 1;
            setPagingInfo({...pagingInfo, currentPage: pc});
            let el = document.getElementById("rtpc");
            
            if (el) {
                el.value = pc;
            }
        }
    };
    
    const onPageUp = () => {
        if (pagingInfo.currentPage > 1) {
            let pc = pagingInfo.currentPage - 1;
            setPagingInfo({...pagingInfo, currentPage: pc});
            
            let el = document.getElementById("rtpc");
            
            if (el) {
                el.value = pc;
            }
        }
    };
    
    const getPageDisplay = () => {
        let retval = getText("Total Records:") + " " + dataSet.length;
    
        if (dataSet && pagingInfo.visibleRecordCount && (dataSet.length !== pagingInfo.visibleRecordCount)) {
            retval = retval + ", " + getText("Filtered Records:") + " " + pagingInfo.visibleRecordCount; 
        }
        
        return retval;
    };
    
    const getElapsedTime = () => {
        if (elapsedTime && (elapsedTime > -1)) {
            return getText("Time(sec):", " ") + elapsedTime;
        } else {
            return "";
        }
    }
    
    return (<div className="page-input">
        {getText("Page Size:")}
        <select onChange={e => onPageSize(e)}>{getPageSizes()}</select>
        {getText("Page:")}&nbsp;
        <AiOutlineStepBackward className="icon cobaltBlue-f" size={SMALL_ICON_SIZE} onClick={e => onHome()}/>
        <AiFillCaretLeft className="icon cobaltBlue-f" size={SMALL_ICON_SIZE} onClick={e => onPageUp()}/>
        <NumberEntry 
            id="rtpc"
            name="pagecontrol" 
            defaultValue={1} 
            min={1} 
            max={pagingInfo.pageCount} 
            handleArrowUp={onPageUp}
            handleArrowDown={onPageDown}
            onChange={e => onPage(e)} />
        <AiFillCaretRight className="icon cobaltBlue-f" size={SMALL_ICON_SIZE} onClick={e => onPageDown()}/>
        <AiOutlineStepForward className="icon cobaltBlue-f" size={SMALL_ICON_SIZE} onClick={e => onEnd()}/>
        {" " + getText("of")  + " " + pagingInfo.pageCount}
        &nbsp;&nbsp;&nbsp;&nbsp;
        {getPageDisplay()}
        <span style={{marginLeft: "25px"}}>{getElapsedTime()}</span>
    </div>);
};

PageControl.propTypes = {
    dataSet: PropTypes.object.isRequired,
    pagingInfo: PropTypes.object.isRequired,
    setPagingInfo: PropTypes.func.isRequired,
    elapsedTime: PropTypes.number
};


export default PageControl;