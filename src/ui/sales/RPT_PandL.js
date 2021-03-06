﻿import RPT_PandL_Form from './RPT_PandL_Form';
import ReactDOM from 'react-dom';
import React, {Component} from 'react';
import {observable, toJSON, extendObservable} from 'mobx';
import * as constants from '../../constants.js';
import { NotificationManager} from 'react-notifications';
import dailyreports_Store from '../../store/report/dailyreports_Store';
import moment  from "moment";


export default class RPT_PandL extends React.Component 
{
    constructor (props) {
        super(props);
        this.RPT_PandLOptions = observable(dailyreports_Store);
        this.branches=[];
        this.salesmen=[];
        var branch = JSON.parse(window.sessionStorage["userInfo"]).branch;
        if(branch)
            constants.ERP_BRANCH = branch; 
        this.viewReport = this.viewReport.bind(this);
        this.printReport = this.printReport.bind(this);
        this.printReportPlain = this.printReportPlain.bind(this);
        this.resetOptions = this.resetOptions.bind(this);
       
    }
    printReport (event) {   
        var fromdate
        var fromdated
        var todate =  moment(this.RPT_PandLOptions.todate).format("YYYYMMDD") ;        
        var todated =  moment(this.RPT_PandLOptions.todate).format("DD/MM/YYYY") ;
        var hd;
        if (this.RPT_PandLOptions.truefalse==="true")
        {
            fromdate =''
            fromdated=''
            hd='Upto ' + todated
        }
        else
        {
            fromdate =  moment(this.RPT_PandLOptions.fromdate).format("YYYYMMDD") ;
            fromdated =  moment(this.RPT_PandLOptions.fromdate).format("DD/MM/YYYY") ;
            hd='From ' + fromdated + ' to ' + todated
        }
        
        var RefNo='PROC|' + constants.getprocedurename('SP_GetPandL',constants.COMPANY) +   ';@dtFrom|\'' + fromdate + '\';@dtTo|\'' + todate + '\';@br|\'' + constants.getFieldValue(this.RPT_PandLOptions.branch) + '\'';
        var reportURL=constants.REPORTURL + '/ReportPrint.aspx?ReportCode=RPTPANDL&RefNo=' + RefNo + '&heading=' + hd + '&subheading=' + constants.getFieldValue(this.RPT_PandLOptions.branch) + '&Company=' + constants.COMPANY
        window.open(reportURL,'new window', 'fullscreen=yes, scrollbars=auto, height=screen.height, left=0, top=0, width=screen.width, dependant=no, location=0, alwaysRaised=no, menubar=no, resizeable=no, scrollbars=n, toolbar=no, status=no, center=yes')        
    }
    printReportPlain (event) {   
        var fromdate
        var fromdated
        var todate =  moment(this.RPT_PandLOptions.todate).format("YYYYMMDD") ;        
        var todated =  moment(this.RPT_PandLOptions.todate).format("DD/MM/YYYY") ;
        var hd;
        if (this.RPT_PandLOptions.truefalse==="true")
        {
            fromdate =''
            fromdated=''
            hd='Upto ' + todated
        }
        else
        {
            fromdate =  moment(this.RPT_PandLOptions.fromdate).format("YYYYMMDD") ;
            fromdated =  moment(this.RPT_PandLOptions.fromdate).format("DD/MM/YYYY") ;
            hd='From ' + fromdated + ' to ' + todated
        }
        
        var RefNo='PROC|' + constants.getprocedurename('SP_GetPandL',constants.COMPANY) +   ';@dtFrom|\'' + fromdate + '\';@dtTo|\'' + todate + '\';@br|\'' + constants.getFieldValue(this.RPT_PandLOptions.branch) + '\'';
        var reportURL=constants.REPORTURL + '/ReportPrint.aspx?ReportCode=RPTPANDL_PLN&RefNo=' + RefNo + '&heading=' + hd + '&subheading=' + constants.getFieldValue(this.RPT_PandLOptions.branch) + '&Company=' + constants.COMPANY
        window.open(reportURL,'new window', 'fullscreen=yes, scrollbars=auto, height=screen.height, left=0, top=0, width=screen.width, dependant=no, location=0, alwaysRaised=no, menubar=no, resizeable=no, scrollbars=n, toolbar=no, status=no, center=yes')        
    }   
    resetOptions (event){}

    viewReport (event) {
        var fromdate 
        var todate =  moment(this.RPT_PandLOptions.todate).format("YYYYMMDD") ;
        if (this.RPT_PandLOptions.truefalse==="true")
        {
            fromdate =''
        }
        else
        {
            fromdate =  moment(this.RPT_PandLOptions.fromdate).format("YYYYMMDD") ;
        }
        window.setcompany();
        var loadrequest = {parem1:fromdate,parem2:todate,parem3: constants.getFieldValue(this.RPT_PandLOptions.branch), company:constants.COMPANY}
        var dailyreportdata = this.RPT_PandLOptions;
        window.openModal(); $.ajax({
            url: constants.SERVICEURL +'/getpandl',
            type: 'POST',
            dataType: 'json',
            data: loadrequest,
            success: function (respoce, textStatus, xhr) {  window.closeModal();
                var grid;
                var data = respoce;
                var dataView;
                var columns = [
                  { id: "txt1", name: "Account No.", field: "txt1", width: 80, cssClass: "cell-title", formatter:sumidLabel },
                  { id: "txt2", name: "Account Name", field: "txt2", width: 400, formatter:sumTotalLabel },
                  { id: "amt1", name: "Amount", field: "amt1", minWidth: 120, formatter:numformatter },
                  { id: "amt2", name: "Sub Total", field: "amt2", minWidth: 120 , formatter:numformatter1}
                ];
                var columnFilters = {};
                function filter(item) {
                    for (var columnId in columnFilters) {
                        if (columnId !== undefined && columnFilters[columnId] !== "") {
                            var c = grid.getColumns()[grid.getColumnIndex(columnId)];
                            if (!(item[c.field] && ("" + item[c.field]).indexOf(columnFilters[columnId]) !== -1)) {
                                return false;
                            }
                        }
                    }
                    return true;
                }
                function numformatter(row, cell, value, columnDef, dataContext){
                    if ((value === 0)|| (value===null))
                        {return ''}
                    else
                    {
                        return "<span style='float: right;'>"  + constants.number_format(value,2) + "</span>" ; 
                    }
                        
                }
                function numformatter1(row, cell, value, columnDef, dataContext){
                    if (value!=0)
                    {
                        if (dataContext.txt1<-10){
                            return "<span style='float: right;color:black;font-weight:800'>"+  constants.number_format(value,2) +"</span>" ;}
                        else if  (dataContext.txt1<0)
                        {return "<span style='float: right;color:black;font-weight:700'>"+ constants.number_format(value,2)+ "</span>" ;}
                        else
                        {return "<span style='float: right;'>"  + constants.number_format(value,2) + "</span>" ; }
                    }
                    else{return ''}
                        
                }
                function sumidLabel (row, cell, value, columnDef, dataContext){
                    if (value<0) {
                        return ""}
                    else {return value}
                }

                function sumTotalLabel (row, cell, value, columnDef, dataContext){
                    if (dataContext.txt1<-10){
                        return "<span style='color:black;font-weight:800'>"+  value +"</span>" ;}
                    else if  (dataContext.txt1<0)
                    {return "<span style='color:black;font-weight:700'>"+ value +"</span>" ;}
                    else
                    {return value}
                }
                var options = {
                    autoEdit: false,
                   enableCellNavigation: false,forceFitColumns: true,
                    showHeaderRow: true,
                    headerRowHeight: 24,
                    explicitInitialization: true
                };
                function openDetails() {

                }
                dataView = new Slick.Data.DataView();
                grid = new Slick.Grid("#soaGrid", dataView, columns, options);
                dataView.onRowCountChanged.subscribe(function (e, args) {
                    grid.updateRowCount();
                    grid.render();
                });
                dataView.onRowsChanged.subscribe(function (e, args) {
                    grid.invalidateRows(args.rows);
                    grid.render();
                });
                $(grid.getHeaderRow()).delegate(":input", "change keyup", function (e) {
                    var columnId = $(this).data("columnId");
                    if (columnId != null) {
                        columnFilters[columnId] = $.trim($(this).val());
                        dataView.refresh();
                    }
                });
                grid.onHeaderRowCellRendered.subscribe(function (e, args) {
                    $(args.node).empty();
                    $("<input type='text'>")
                       .data("columnId", args.column.id)
                       .val(columnFilters[args.column.id])
                       .appendTo(args.node);
                });
                grid.onClick.subscribe(function (e, args) {
                    var fromdate =  '' ;
                    var todate =  moment(dailyreportdata.todate).format("YYYYMMDD") ;
                    window.setcompany();
                    var loadrequest = {
                        parem1:dataView.getItem(args.row).txt1,
                        parem3:todate,
                        parem2:fromdate,
                        parem4:constants.ERP_BRANCH,
                        company:constants.COMPANY}
                    window.SOApopupshow(loadrequest);
                });
                grid.init();
                dataView.beginUpdate();
                dataView.setItems(data);
                dataView.setFilter(filter);
                dataView.endUpdate();

                var h = 0;

            
            },
            error: function (xhr, textStatus, errorThrown) { window.closeModal();
                console.log('Error in Operation');
            }
        });

    }
render () {
    return(
    <div>   
           
        {  <RPT_PandL_Form RPT_PandLOptions={this.RPT_PandLOptions} 
            viewReport = {this.viewReport} printReport={this.printReport} printReportPlain={this.printReportPlain} 
resetOptions={this.resetOptions} reportTitle='Profit and Loss Account'/> }

    </div>
        )
}

}

