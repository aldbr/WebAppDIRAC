Ext.define('DIRAC.PilotMonitor.classes.PilotMonitor', {
      extend : 'Ext.dirac.core.Module',

      requires : ['Ext.util.*', 'Ext.panel.Panel', "Ext.form.field.Text", "Ext.button.Button", "Ext.menu.CheckItem", "Ext.menu.Menu", "Ext.form.field.ComboBox", "Ext.layout.*", "Ext.toolbar.Paging", "Ext.grid.Panel", "Ext.form.field.Date", "Ext.form.field.TextArea",
          "Ext.dirac.utils.DiracToolButton", "Ext.dirac.utils.DiracApplicationContextMenu"],

      applicationsToOpen : {
        'JobMonitor' : 'DIRAC.JobMonitor.classes.JobMonitor'
      },

      loadState : function(data) {

        var me = this;

        var me = this;

        me.grid.loadState(data);

        me.leftPanel.loadState(data);

        if (data.leftPanelCollapsed) {

          if (data.leftPanelCollapsed)
            me.leftPanel.collapse();

        }

        if ("centralGridPanelVisible" in data) {

          if (!data.centralGridPanelVisible) {

            me.centralWorkPanel.getLayout().setActiveItem(1);

          }

        }

        if ("statisticsSelectionPanelCollapsed" in data) {

          if (data.statisticsSelectionPanelCollapsed) {

            me.statisticsSelectionGrid.collapse();

          }

        }

        if ("statisticsSelectionValues" in data) {

          me.statisticsGridComboMain.suspendEvents(false);
          me.statisticsGridCombo.suspendEvents(false);
          me.statisticsGridComboMain.setValue(data.statisticsSelectionValues[0]);
          me.statisticsGridCombo.setValue(data.statisticsSelectionValues[1]);
          me.statisticsGridComboMain.resumeEvents();
          me.statisticsGridCombo.resumeEvents();

        }
      },

      getStateData : function() {

        var me = this;

        // data for grid columns
        var oReturn = {
          leftMenu : me.leftPanel.getStateData(),
          grid : me.grid.getStateData()
          // show/hide for selectors and their selected data (including NOT
          // button)
        };

        oReturn.leftPanelCollapsed = me.leftPanel.collapsed;
        oReturn.centralGridPanelVisible = !me.grid.hidden;
        oReturn.statisticsSelectionPanelCollapsed = me.statisticsSelectionGrid.collapsed;
        oReturn.statisticsSelectionValues = [me.statisticsGridComboMain.getValue(), me.statisticsGridCombo.getValue()];

        return oReturn;

      },
      dataFields : [{
            name : 'Status'
          }, {
            name : 'OwnerGroup'
          }, {
            name : 'LastUpdateTime',
            type : 'date',
            dateFormat : 'Y-m-d H:i:s'
          }, {
            name : 'DestinationSite'
          }, {
            name : 'GridType'
          }, {
            name : 'TaskQueueID'
          }, {
            name : 'CurrentJobID'
          }, {
            name : 'BenchMark',
            type : 'float'
          }, {
            name : 'Broker'
          }, {
            name : 'OwnerDN'
          }, {
            name : 'GridSite'
          }, {
            name : 'PilotID'
          }, {
            name : 'ParentID'
          }, {
            name : 'SubmissionTime',
            type : 'date',
            dateFormat : 'Y-m-d H:i:s'
          }, {
            name : 'PilotJobReference'
          }, {
            name : 'Owner'
          }, {
            name : 'StatusIcon',
            mapping : 'Status'
          }],

      initComponent : function() {

        var me = this;

        if (GLOBAL.VIEW_ID == "desktop") {

          me.launcher.title = "Pilot Monitor";
          me.launcher.maximized = false;

          var oDimensions = GLOBAL.APP.MAIN_VIEW.getViewMainDimensions();

          me.launcher.width = oDimensions[0];
          me.launcher.height = oDimensions[1];

          me.launcher.x = 0;
          me.launcher.y = 0;

        }

        if (GLOBAL.VIEW_ID == "tabs") {

          me.launcher.title = "Pilot Monitor";
          me.launcher.maximized = false;

          var oDimensions = GLOBAL.APP.MAIN_VIEW.getViewMainDimensions();

          me.launcher.width = oDimensions[0];
          me.launcher.height = oDimensions[1];

          me.launcher.x = 0;
          me.launcher.y = 0;

        }

        Ext.apply(me, {
              layout : 'border',
              bodyBorder : false,
              defaults : {
                collapsible : true,
                split : true
              }
            });

        me.callParent(arguments);

      },

      buildUI : function() {

        var me = this;

        me.statisticsPanel = new Ext.create('Ext.panel.Panel', {
              header : false,
              region : 'center',
              floatable : false,
              // autoScroll : true,
              hidden : true,
              collapsible : false,
              layout : "border",
              defaults : {
                collapsible : true,
                split : true
              }
            });

        /*
         * -----------------------------------------------------------------------------------------------------------
         * DEFINITION OF THE LEFT PANEL
         * -----------------------------------------------------------------------------------------------------------
         */

        var selectors = {
          site : "Site",
          status : "Status",
          computingElement : "Computing Element",
          ownerGroup : "Owner Group",
          owner : "Owner",
          broker : "Broker"
        };

        var textFields = {
          'taskQueueId' : {
            name : "Task Queue ID",
            type : "number"
          },
          'pilotId' : {
            name : "Pilot Job Reference"
          }
        };

        var map = [["site", "site"], ["status", "status"], ["computingElement", "computingElement"], ["ownerGroup", "ownerGroup"], ["owner", "owner"], ["broker", "broker"]];

        me.leftPanel = Ext.create('Ext.dirac.utils.DiracBaseSelector', {
              scope : me,
              cmbSelectors : selectors,
              textFields : textFields,
              datamap : map,
              url : "PilotMonitor/getSelectionData"
            });

        /*
         * -----------------------------------------------------------------------------------------------------------
         * DEFINITION OF THE GRID
         * -----------------------------------------------------------------------------------------------------------
         */

        var oProxy = Ext.create('Ext.dirac.utils.DiracAjaxProxy', {
              url : GLOBAL.BASE_URL + me.applicationName + '/getPilotData'
            });

        me.dataStore = Ext.create("Ext.dirac.utils.DiracJsonStore", {
              autoLoad : false,
              proxy : oProxy,
              fields : me.dataFields,
              scope : me
            });

        var pagingToolbar = {};

        var pagingToolbar = {};

        var toolButtons = {
          'Visible' : [{
                "text" : "",
                "handler" : me.__setActiveItemInTheCentralWorkPanel,
                "arguments" : [],
                "properties" : {
                  iconCls : "dirac-icon-pie",
                  tooltip : "Go to the statistics panel"
                }
              }]
        };

        pagingToolbar = Ext.create("Ext.dirac.utils.DiracPagingToolbar", {
              toolButtons : toolButtons,
              store : me.dataStore,
              scope : me
            });

        me.btnStatisticsPanel = new Ext.Button({
              text : '',
              iconCls : "dirac-icon-pie",
              tooltip : "Go to the statistics panel",
              handler : function() {
                me.__setActiveItemInTheCentralWorkPanel()

              }
            });

        var showJobshandler = function() {
          var oId = GLOBAL.APP.CF.getFieldValueFromSelectedRow(me.grid, "CurrentJobID");
          if (oId != '-') {
            var oSetupData = {};
            if (GLOBAL.VIEW_ID == "desktop") { // we needs these
              // information only
              // for the desktop
              // layout.

              var oDimensions = GLOBAL.APP.MAIN_VIEW.getViewMainDimensions();
              oSetupData.x = 0;
              oSetupData.y = 0;
              oSetupData.width = oDimensions[0];
              oSetupData.height = oDimensions[1];
              oSetupData.currentState = "";

              oSetupData.desktopStickMode = 0;
              oSetupData.hiddenHeader = 1;
              oSetupData.i_x = 0;
              oSetupData.i_y = 0;
              oSetupData.ic_x = 0;
              oSetupData.ic_y = 0;

            }

            oSetupData.data = {

              leftMenu : {
                JobID : oId
              }
            };

            GLOBAL.APP.MAIN_VIEW.createNewModuleContainer({
                  objectType : "app",
                  moduleName : me.applicationsToOpen["JobMonitor"],
                  setupData : oSetupData
                });
          }
        };
        var menuitems = {
          'Visible' : [{
                "text" : "Show Jobs",
                "handler" : showJobshandler,
                "properties" : {
                  tooltip : 'Click to show the jobs which belong to the selected transformation(s).'
                }
              }, {
                "text" : "-"
              }, {
                "text" : "Pilot Output",
                "handler" : me.__oprGetJobData,
                "arguments" : ["getPilotOutput"],
                "properties" : {
                  tooltip : 'Get the pilot output!'
                }
              }, {
                "text" : "Pilot Error",
                "handler" : me.__oprGetJobData,
                "arguments" : ["getPilotError"],
                "properties" : {
                  tooltip : 'Get the pilot error log!'
                }
              }, {
                "text" : "Logging info",
                "handler" : me.__oprGetJobData,
                "arguments" : ["getLoggingInfo"],
                "properties" : {
                  tooltip : 'Get the pilot log!'
                }
              }]
        };

        me.contextGridMenu = new Ext.dirac.utils.DiracApplicationContextMenu({
              menu : menuitems,
              scope : me
            });

        var columns = {
          "checkBox" : {
            "dataIndex" : "CurrentJobID"
          },
          "PilotJobReference" : {
            "dataIndex" : "PilotJobReference",
            "properties" : {
              flex : 1
            }
          },
          "None" : {
            "dataIndex" : "StatusIcon",
            "properties" : {
              width : 26,
              sortable : false,
              hideable : false,
              fixed : true,
              menuDisabled : true
            },
            "renderFunction" : "rendererStatus"
          },
          "Status" : {
            "dataIndex" : "Status"
          },
          "Site" : {
            "dataIndex" : "GridSite",
            "properties" : {
              flex : 1
            }
          },
          "ComputingElement" : {
            "dataIndex" : "DestinationSite",
            "properties" : {
              flex : 1
            }
          },
          "Broker" : {
            "dataIndex" : "Broker"
          },
          "CurrentJobID" : {
            "dataIndex" : "CurrentJobID"
          },
          "GridType" : {
            "dataIndex" : "GridType"
          },
          "TaskQueueID" : {
            "dataIndex" : "TaskQueueID"
          },
          "BenchMark" : {
            "dataIndex" : "BenchMark"
          },
          "Owner" : {
            "dataIndex" : "Owner",
            "properties" : {
              hidden : true
            }
          },
          "OwnerDN" : {
            "dataIndex" : "OwnerDN",
            "properties" : {
              hidden : true
            }
          },
          "OwnerGroup" : {
            "dataIndex" : "OwnerGroup"
          },
          "PilotID" : {
            "dataIndex" : "PilotID",
            "properties" : {
              hidden : true
            }
          },
          "ParentID" : {
            "dataIndex" : "ParentID",
            "properties" : {
              hidden : true
            }
          },
          "LastUpdateTime[UTC]" : {
            "dataIndex" : "LastUpdateTime",
            "renderer" : Ext.util.Format.dateRenderer('Y-m-d H:i:s'),
            "properties" : {
              width : 150
            }
          },
          "SubmissionTime[UTC]" : {
            "dataIndex" : "SubmissionTime",
            "renderer" : Ext.util.Format.dateRenderer('Y-m-d H:i:s'),
            "properties" : {
              width : 150
            }
          }
        };

        me.grid = Ext.create('Ext.dirac.utils.DiracGridPanel', {
              store : me.dataStore,
              // features: [{ftype:'grouping'}],
              oColumns : columns,
              contextMenu : me.contextGridMenu,
              pagingToolbar : pagingToolbar,
              scope : me
            });

        me.leftPanel.setGrid(me.grid);

        me.grid.columns[1].setSortState("DESC");

        me.statisticsGridComboMain = new Ext.form.field.ComboBox({
              allowBlank : false,
              displayField : 'set',
              editable : false,
              mode : 'local',
              store : new Ext.data.ArrayStore({
                    fields : ['set'],
                    data : [["Selected Statistics"], ["Global Statistics"]]
                  }),
              triggerAction : 'all',
              value : "Selected Statistics",
              flex : 1,
              listeners : {

                "change" : function(combo, newValue, oldValue, eOpts) {

                  var me = combo.moduleObject;
                  me.leftPanel.oprLoadGridData();

                }

              },
              moduleObject : me
            });

        me.statisticsGridCombo = new Ext.form.field.ComboBox({
              allowBlank : false,
              displayField : 'category',
              editable : false,
              mode : 'local',
              store : new Ext.data.ArrayStore({
                    fields : ['category'],
                    data : [["Status"], ["Site"], ["Computing Element"], ["Owner Group"], ["Owner"], ["Broker"]]
                  }),
              triggerAction : 'all',
              value : "Status",
              flex : 1,
              listeners : {

                "change" : function(combo, newValue, oldValue, eOpts) {

                  var me = combo.moduleObject;
                  me.leftPanel.oprLoadGridData();

                }

              },
              moduleObject : me
            });

        var oButtonGoToGrid = new Ext.Button({

              margin : 0,
              iconCls : "pm-grid-icon",
              handler : function() {
                me.centralWorkPanel.getLayout().setActiveItem(0);
              },
              scope : me

            });

        me.btnShowPlotAsPng = new Ext.Button({

              margin : 0,
              iconCls : "dirac-icon-save",
              handler : function() {

                var sSvgElement = document.getElementById(me.id + "-statistics-plot").getElementsByTagName("svg")[0].parentNode.innerHTML;

                var iHeight = me.statisticsPlotPanel.getHeight();

                var iWidth = me.statisticsPlotPanel.getWidth();

                var canvas = document.createElement('canvas');
                canvas.setAttribute('width', iWidth);
                canvas.setAttribute('height', iHeight);

                var oContext = canvas.getContext("2d");

                oContext.beginPath();
                oContext.rect(0, 0, iWidth, iHeight);
                oContext.fillStyle = "#FFFFFF";
                oContext.fill();

                var oImage = new Image();
                oImage.src = GLOBAL.ROOT_URL + 'static/core/img/wallpapers/dirac_jobmonitor_background.png';

                oImage.onload = function() {

                  console.log([oImage.clientWidth, oImage.clientHeight]);

                  oContext.drawImage(oImage, 0, 0, iWidth, iHeight);

                  oContext.drawSvg(sSvgElement, 0, 0);

                  var imgData = canvas.toDataURL("image/png");
                  window.location = imgData.replace("image/png", "image/octet-stream");

                }

              },
              scope : me,
              tooltip : "Save pie chart as PNG image"
            });

        me.btnPlotSettings = new Ext.Button({

              margin : 0,
              iconCls : "dirac-icon-pie",
              handler : function() {

                me.formPlotSettings();

              },
              scope : me,
              tooltip : "Plot settings"
            });

        /*-----------AUTO REFRESH---------------*/
        var oTask = {
          run : function() {
            me.leftPanel.oprLoadGridData();
          },
          interval : 0
        }

        var oHeartbeat = new Ext.util.TaskRunner();

        var oAutoMenu = [{
              handler : function() {
                this.setChecked(true);
                oHeartbeat.start(Ext.apply(oTask, {
                      interval : 900000
                    }));
              },
              group : 'refresh',
              text : '15 Minutes'
            }, {
              handler : function() {
                this.setChecked(true);
                oHeartbeat.start(Ext.apply(oTask, {
                      interval : 1800000
                    }));
              },
              group : 'refresh',
              text : '30 Minutes'
            }, {
              handler : function() {
                this.setChecked(true);
                oHeartbeat.start(Ext.apply(oTask, {
                      interval : 3600000
                    }));
              },
              group : 'refresh',
              text : 'One Hour'
            }, {
              checked : true,
              handler : function() {
                this.setChecked(true);
                oHeartbeat.stopAll();
              },
              group : 'refresh',
              text : 'Disabled'
            }];

        for (var i = 0; i < oAutoMenu.length; i++) {
          oAutoMenu[i] = new Ext.menu.CheckItem(oAutoMenu[i]);
        }

        var btnAutorefresh = new Ext.Button({
              menu : oAutoMenu,
              text : 'Auto Refresh: Disabled',
              tooltip : 'Click to set the time for autorefresh'
            });

        btnAutorefresh.on('menuhide', function(button, menu) {
              var length = menu.items.getCount();
              for (var i = 0; i < length; i++) {
                if (menu.items.items[i].checked) {
                  button.setText("Auto Refresh: " + menu.items.items[i].text);
                }
              }
            });

        var oColumns = {
          "None" : {
            "dataIndex" : "key",
            "properties" : {
              width : 26,
              sortable : false,
              hideable : false,
              fixed : true,
              menuDisabled : true
            },
            "renderFunction" : "rendererStatus"
          },
          "Key" : {
            "dataIndex" : "key",
            "properties" : {
              hideable : false,
              width : 150
            }
          },
          "Value" : {
            "dataIndex" : "value",
            "properties" : {
              flex : 1
            },
            "renderFunction" : "diffValues"
          }
        };

        var dataStore = Ext.create("Ext.dirac.utils.DiracArrayStore", {
              fields : ["key", "value", "code", "color"],
              oDiffFields : {
                'Id' : 'key',
                'Fields' : ["value"]
              },
              scope : me
            });

        /*---------------------------------------------------*/
        me.statisticsSelectionGrid = Ext.create("Ext.dirac.utils.DiracGridPanel", {
              region : 'west',
              store : dataStore,
              width : 300,
              header : false,
              border : 0,
              viewConfig : {
                stripeRows : true,
                enableTextSelection : true
              },
              dockedItems : [new Ext.create('Ext.toolbar.Toolbar', {
                        dock : "top",
                        items : [oButtonGoToGrid, me.btnShowPlotAsPng, me.btnPlotSettings, '-', btnAutorefresh]
                      }), new Ext.create('Ext.toolbar.Toolbar', {
                        dock : "top",
                        items : [me.statisticsGridComboMain]
                      }), new Ext.create('Ext.toolbar.Toolbar', {
                        dock : "top",
                        items : [me.statisticsGridCombo]
                      })],
              oColumns : oColumns,
              scope : me
            })

        me.statisticsPlotPanel = new Ext.create('Ext.panel.Panel', {
              region : 'center',
              floatable : false,
              layout : 'fit',
              header : false,
              items : [{
                    html : "<div id='" + me.id + "-statistics-plot' style='width:100%;'></div>",
                    xtype : "box",
                    cls : 'pm-statistics-plot-background'
                  }]
            });

        me.statisticsPlotPanel.onResize = function(width, height, oldWidth, oldHeight) {

          me.createPlotFromGridData(me.statisticsGridComboMain.getValue() + " :: " + me.statisticsGridCombo.getValue());

        };

        me.statisticsPanel.add([me.statisticsSelectionGrid, me.statisticsPlotPanel]);

        /* END - Definition of the statistics panel */

        /*
         * -----------------------------------------------------------------------------------------------------------
         * DEFINITION OF THE MAIN CONTAINER
         * -----------------------------------------------------------------------------------------------------------
         */

        me.centralWorkPanel = new Ext.create('Ext.panel.Panel', {
              floatable : false,
              layout : 'card',
              region : "center",
              header : false,
              border : false,
              items : [me.grid, me.statisticsPanel]
            });

        /*
         * -----------------------------------------------------------------------------------------------------------
         * DEFINITION OF THE MAIN CONTAINER
         * -----------------------------------------------------------------------------------------------------------
         */
        me.add([me.leftPanel, me.centralWorkPanel]);
        // me.add([me.leftPanel, me.grid]);

      },

      __oprGetJobData : function(oDataKind) {

        var me = this;
        var oId = GLOBAL.APP.CF.getFieldValueFromSelectedRow(me.grid, "PilotJobReference");

        me.getContainer().body.mask("Wait ...");

        Ext.Ajax.request({
              url : GLOBAL.BASE_URL + 'PilotMonitor/getJobInfoData',
              method : 'POST',
              params : {
                data_kind : oDataKind,
                data : oId
              },
              scope : me,
              success : function(response) {

                me.getContainer().body.unmask();
                var jsonData = Ext.JSON.decode(response.responseText);

                if (jsonData["success"] == "true") {

                  if (oDataKind == "getPilotOutput") {

                    me.__oprPrepareAndShowWindowText(jsonData["result"], "Pilot Output for Job Reference:" + oId);

                  } else if (oDataKind == "getPilotError") {

                    me.__oprPrepareAndShowWindowText(jsonData["result"], "Pilot Error for Job Reference:" + oId);

                  } else if (oDataKind == "getLoggingInfo") {

                    me.__oprPrepareAndShowWindowText(jsonData["result"], "Pilot Logging Info for Job Reference:" + oId);

                  }

                } else {

                  GLOBAL.APP.CF.alert(jsonData["error"], "error");

                }

              }
            });
      },

      __oprPrepareAndShowWindowText : function(sTextToShow, sTitle) {

        var me = this;

        var oWindow = me.getContainer().createChildWindow(sTitle, false, 700, 500);

        var oTextArea = new Ext.create('Ext.form.field.TextArea', {
              value : sTextToShow,
              cls : "pm-textbox-help-window"

            });

        oWindow.add(oTextArea);
        oWindow.show();

      },
      __oprPrepareAndShowWindowGrid : function(oData, sTitle, oFields, oColumns) {

        var me = this;

        var oStore = new Ext.data.ArrayStore({
              fields : oFields,
              data : oData
            });

        var oWindow = me.getContainer().createChildWindow(sTitle, false, 700, 500);

        var oGrid = Ext.create('Ext.grid.Panel', {
              store : oStore,
              columns : oColumns,
              width : '100%',
              viewConfig : {
                stripeRows : true,
                enableTextSelection : true
              }
            });

        oWindow.add(oGrid);
        oWindow.show();

      },
      __setActiveItemInTheCentralWorkPanel : function() {
        var me = this;
        me.centralWorkPanel.getLayout().setActiveItem(1);
      },
      createPlotFromGridData : function(sTitle, sLegendPosition) {

        var me = this;

        if (!sLegendPosition) {
          if (("plotSettings" in me) && ("backupSettings" in me.plotSettings)) {
            sLegendPosition = me.plotSettings.backupSettings.legend;
          } else {
            sLegendPosition = "right";
          }
        }

        var oStore = me.statisticsSelectionGrid.getStore();
        var oData = [["Key", "Value"]];
        var oColors = [];

        for (var i = 0; i < oStore.getCount(); i++) {

          oData.push([oStore.getAt(i).get("key"), oStore.getAt(i).get("value")]);
          oColors.push(oStore.getAt(i).get("color"));

        }

        var data = google.visualization.arrayToDataTable(oData);

        var oNow = new Date();

        var options = {
          title : sTitle + " (" + oNow.toString() + ")",
          legend : {
            position : sLegendPosition
          },
          colors : oColors,
          backgroundColor : "transparent",
          chartArea : {
            width : "80%",
            height : "80%"
          }
        };

        if (!("plotSettings" in me))
          me.plotSettings = {};

        me.plotSettings.backupSettings = {
          "title" : sTitle,
          "legend" : sLegendPosition
        };

        var iHeight = me.statisticsPlotPanel.getHeight() - 20;
        document.getElementById(me.id + "-statistics-plot").style.height = "" + iHeight + "px";

        var iWidth = me.statisticsPlotPanel.getWidth() - 20;
        document.getElementById(me.id + "-statistics-plot").style.width = "" + iWidth + "px";

        var chart = new google.visualization.PieChart(document.getElementById(me.id + "-statistics-plot"));
        chart.draw(data, options);

      },
      formPlotSettings : function() {

        var me = this;

        if (!"plotSettings" in me)
          me.plotSettings = {};

        me.plotSettings.txtPlotTitle = Ext.create('Ext.form.field.Text', {

              fieldLabel : "Title",
              labelAlign : 'left',
              allowBlank : false,
              margin : 10,
              anchor : '100%',
              value : me.plotSettings.backupSettings.title

            });

        me.plotSettings.cmbLegendPosition = new Ext.create('Ext.form.field.ComboBox', {
              labelAlign : 'left',
              fieldLabel : 'Legend position',
              store : new Ext.data.ArrayStore({
                    fields : ['value', 'text'],
                    data : [["right", "right"], ["left", "left"], ["top", "top"], ["bottom", "bottom"], ["none", "none"]]
                  }),
              displayField : "text",
              valueField : "value",
              anchor : "100%",
              margin : 10,
              value : me.plotSettings.backupSettings.legend
            });

        // button for saving the state
        me.plotSettings.btnApplySettings = new Ext.Button({

              text : 'Submit',
              margin : 3,
              iconCls : "dirac-icon-submit",
              handler : function() {
                var me = this;
                me.createPlotFromGridData(me.plotSettings.txtPlotTitle.getValue(), me.plotSettings.cmbLegendPosition.getValue());
              },
              scope : me

            });

        var oToolbar = new Ext.toolbar.Toolbar({
              border : false
            });

        oToolbar.add([me.plotSettings.btnApplySettings]);

        var oPanel = new Ext.create('Ext.panel.Panel', {
              autoHeight : true,
              border : false,
              layout : "anchor",
              items : [oToolbar, me.plotSettings.txtPlotTitle, me.plotSettings.cmbLegendPosition, me.txtElementConfig]
            });

        // initializing window showing the saving form
        Ext.create('widget.window', {
              height : 300,
              width : 500,
              title : "Plot Settings",
              layout : 'fit',
              modal : true,
              items : oPanel
            }).show();

      },

      funcOnChangeEitherCombo : function() {

        var me = this;

        var sSet = me.statisticsGridComboMain.getValue();
        var sCategory = me.statisticsGridCombo.getValue();

        me.statisticsGridComboMain.setDisabled(true);
        me.statisticsGridCombo.setDisabled(true);

        if (sSet == "Selected Statistics") {

          var oData = me.leftPanel.getSelectionData();
          oData.statsField = sCategory;

          me.statisticsSelectionGrid.body.mask("Wait ...");

          Ext.Ajax.request({
                url : GLOBAL.BASE_URL + me.applicationName + '/getStatisticsData',
                params : oData,
                scope : me,
                success : function(response) {
                  var response = Ext.JSON.decode(response.responseText);

                  if (response["success"] == "true") {
                    me.statisticsSelectionGrid.store.removeAll();

                    me.statisticsSelectionGrid.store.add(response["result"]);

                    me.createPlotFromGridData(sSet + " :: " + sCategory);

                  } else {
                    GLOBAL.APP.CF.alert(response["error"], "error");
                  }

                  me.statisticsSelectionGrid.body.unmask();
                  me.statisticsGridComboMain.setDisabled(false);
                  me.statisticsGridCombo.setDisabled(false);
                },
                failure : function(response) {
                  me.statisticsGridComboMain.setDisabled(false);
                  me.statisticsGridCombo.setDisabled(false);
                  me.statisticsSelectionGrid.body.unmask();
                  GLOBAL.APP.CF.showAjaxErrorMessage(response);
                }
              });
        } else {

          me.statisticsSelectionGrid.body.mask("Wait ...");

          Ext.Ajax.request({
                url : GLOBAL.BASE_URL + me.applicationName + '/getStatisticsData',
                params : {
                  statsField : sCategory,
                  globalStat : true
                },
                scope : me,
                success : function(response) {
                  var response = Ext.JSON.decode(response.responseText);

                  if (response["success"] == "true") {
                    me.statisticsSelectionGrid.store.removeAll();

                    me.statisticsSelectionGrid.store.add(response["result"]);

                    me.createPlotFromGridData(sSet + " :: " + sCategory);

                  } else {
                    GLOBAL.APP.CF.alert(response["error"], "error");
                  }
                  me.statisticsSelectionGrid.body.unmask();
                  me.statisticsGridComboMain.setDisabled(false);
                  me.statisticsGridCombo.setDisabled(false);
                },
                failure : function(response) {
                  me.statisticsSelectionGrid.body.unmask();
                  me.statisticsGridComboMain.setDisabled(false);
                  me.statisticsGridCombo.setDisabled(false);
                  GLOBAL.APP.CF.showAjaxErrorMessage(response);
                }
              });

        }

      }

    });
