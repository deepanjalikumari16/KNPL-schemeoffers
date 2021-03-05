sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/model/Sorter",
    "sap/ui/Device",
  ],
  function (
    BaseController,
    JSONModel,
    formatter,
    Filter,
    FilterOperator,
    MessageBox,
    MessageToast,
    Fragment,
    Sorter,
    Device
  ) {
    "use strict";

    return BaseController.extend(
      "com.knpl.pragati.Complaints.controller.Worklist",
      {
        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the worklist controller is instantiated.
         * @public
         */
        onInit: function () {
          var oRouter = this.getOwnerComponent().getRouter();
          oRouter
            .getRoute("worklist")
            .attachMatched(this._onRouteMatched, this);
        },
        _onRouteMatched: function () {
          this._InitData();
        },
        _InitData: function () {
          var oViewModel,
            iOriginalBusyDelay,
            oTable = this.byId("table");

          // Put down worklist table's original value for busy indicator delay,
          // so it can be restored later on. Busy handling on the table is
          // taken care of by the table itself.
          iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
          // keeps the search state
          this._aTableSearchState = [];

          // Model used to manipulate control states
          oViewModel = new JSONModel({
            worklistTableTitle: this.getResourceBundle().getText(
              "worklistTableTitle"
            ),
            shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
            shareSendEmailSubject: this.getResourceBundle().getText(
              "shareSendEmailWorklistSubject"
            ),
            shareSendEmailMessage: this.getResourceBundle().getText(
              "shareSendEmailWorklistMessage",
              [location.href]
            ),
            tableNoDataText: this.getResourceBundle().getText(
              "tableNoDataText"
            ),
            tableBusyDelay: 0,
            filterBar: {
              ComplaintTypeId: "",
              ComplaintSubTypeId: "",
              CreatedAt: null,
              ComplaintStatus: "",
              Name: "",
            },
          });
          this.setModel(oViewModel, "worklistView");

          // Make sure, busy indication is showing immediately so there is no
          // break after the busy indication for loading the view's meta data is
          // ended (see promise 'oWhenMetadataIsLoaded' in AppController)
          oTable.attachEventOnce("updateFinished", function () {
            // Restore original busy indicator delay for worklist's table
            oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
          });
          this.getView().getModel().refresh();
          this._fiterBarSort();
          this._addSearchFieldAssociationToFB();
        },
        _fiterBarSort: function () {
          if (this._ViewSortDialog) {
            var oDialog = this.getView().byId("viewSetting");
            oDialog.setSortDescending(true);
            oDialog.setSelectedSortItem("CreatedAt");
            var otable = this.getView().byId("table");
            var oSorter = new Sorter({ path: "CreatedAt", descending: true });
            otable.getBinding("items").sort(oSorter);
          }
        },
        onFilter: function () {
          console.log("On FIlter");
          var aCurrentFilterValues = [];
          var oViewFilter = this.getView()
            .getModel("worklistView")
            .getProperty("/filterBar");
          var aFlaEmpty = true;
          for (let prop in oViewFilter) {
            if (oViewFilter[prop]) {
              if (prop === "ComplaintTypeId") {
                aFlaEmpty = false;
                aCurrentFilterValues.push(
                  new Filter(
                    "ComplaintTypeId",
                    FilterOperator.EQ,
                    oViewFilter[prop]
                  )
                );
              } else if (prop === "ComplaintSubTypeId") {
                aFlaEmpty = false;
                aCurrentFilterValues.push(
                  new Filter(
                    "ComplaintSubTypeId",
                    FilterOperator.EQ,
                    oViewFilter[prop]
                  )
                  //new Filter(prop, FilterOperator.BT,oViewFilter[prop],oViewFilter[prop])
                );
              } else if (prop === "CreatedAt") {
                aFlaEmpty = false;
                aCurrentFilterValues.push(
                  new Filter(prop, FilterOperator.LE, oViewFilter[prop])
                  //new Filter(prop, FilterOperator.BT,oViewFilter[prop],oViewFilter[prop])
                );
              } else if (prop === "ComplaintStatus") {
                aFlaEmpty = false;
                aCurrentFilterValues.push(
                  new Filter(prop, FilterOperator.EQ, oViewFilter[prop])
                  //new Filter(prop, FilterOperator.BT,oViewFilter[prop],oViewFilter[prop])
                );
              } else if (prop === "Name") {
                aFlaEmpty = false;
                aCurrentFilterValues.push(
                  new Filter(
                    [
                      new Filter(
                        "tolower(Painter/Name)",
                        FilterOperator.Contains,
                        "'" +
                          oViewFilter[prop]
                            .trim()
                            .toLowerCase()
                            .replace("'", "''") +
                          "'"
                      ),
                      new Filter(
                        "Painter/MembershipCard",
                        FilterOperator.Contains,
                        oViewFilter[prop].trim().toUpperCase()
                      ),
                      new Filter(
                        "Painter/Mobile",
                        FilterOperator.Contains,
                        oViewFilter[prop].trim()
                      ),
                    ],
                    false
                  )
                );
              }
            }
          }

          var endFilter = new Filter({
            filters: aCurrentFilterValues,
            and: true,
          });
          var oTable = this.getView().byId("table");
          var oBinding = oTable.getBinding("items");
          if (!aFlaEmpty) {
            oBinding.filter(endFilter);
          } else {
            oBinding.filter([]);
          }
        },
        onResetFilterBar: function () {
          this._ResetFilterBar();
        },
        _ResetFilterBar: function () {
          var aCurrentFilterValues = [];
          var aResetProp = {
            ComplaintTypeId: "",
            ComplaintSubTypeId: "",
            CreatedAt: null,
            ComplaintStatus: "",
            Name: "",
          };
          var oViewModel = this.getView().getModel("worklistView");
          oViewModel.setProperty("/filterBar", aResetProp);
          //oViewModel.setProperty("/searchBar", "");

          //   for (let prop in aResetProp) {
          //     aCurrentFilterValues.push(
          //       new Filter(prop, FilterOperator.Contains, aResetProp[prop])
          //     );
          //   }
          //   var endFilter = new Filter({
          //     filters: aCurrentFilterValues,
          //     and: false,
          //   });
          var oTable = this.byId("table");
          var oBinding = oTable.getBinding("items");
          oBinding.filter([]);
        },
        _addSearchFieldAssociationToFB: function () {
          let oFilterBar = this.getView().byId("filterbar");
          let oSearchField = oFilterBar.getBasicSearch();
          var oBasicSearch;
          var othat = this;
          if (!oSearchField) {
            // @ts-ignore
            oBasicSearch = new sap.m.SearchField({
              value: "{worklistView>/filterBar/Name}",
              showSearchButton: true,
              search: othat.onFilter.bind(othat),
            });
          } else {
            oSearchField = null;
          }

          oFilterBar.setBasicSearch(oBasicSearch);

          //   oBasicSearch.attachBrowserEvent(
          //     "keyup",
          //     function (e) {
          //       if (e.which === 13) {
          //         this.onSearch();
          //       }
          //     }.bind(this)
          //   );
        },
        fmtStatus: function (mParam) {
           var sLetter = mParam
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
          return sLetter;
        },
        handleSortButtonPressed: function () {
          this.getViewSettingsDialog(
            "com.knpl.pragati.Complaints.view.fragments.SortDialog"
          ).then(function (oViewSettingsDialog) {
            oViewSettingsDialog.open();
          });
        },
        getViewSettingsDialog: function (sDialogFragmentName) {
          if (!this._ViewSortDialog) {
            var othat = this;
            this._ViewSortDialog = Fragment.load({
              id: this.getView().getId(),
              name: sDialogFragmentName,
              controller: this,
            }).then(function (oDialog) {
              if (Device.system.desktop) {
                othat.getView().addDependent(oDialog);
                oDialog.addStyleClass("sapUiSizeCompact");
              }
              return oDialog;
            });
          }
          return this._ViewSortDialog;
        },
        handleSortDialogConfirm: function (oEvent) {
          var oTable = this.byId("table"),
            mParams = oEvent.getParameters(),
            oBinding = oTable.getBinding("items"),
            sPath,
            bDescending,
            aSorters = [];

          sPath = mParams.sortItem.getKey();
          bDescending = mParams.sortDescending;
          aSorters.push(new Sorter(sPath, bDescending));

          // apply the selected sort and group settings
          oBinding.sort(aSorters);
        },

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */

        /**
         * Triggered by the table's 'updateFinished' event: after new table
         * data is available, this handler method updates the table counter.
         * This should only happen if the update was successful, which is
         * why this handler is attached to 'updateFinished' and not to the
         * table's list binding's 'dataReceived' method.
         * @param {sap.ui.base.Event} oEvent the update finished event
         * @public
         */
        onUpdateFinished: function (oEvent) {
          console.log("event");
          // update the worklist's object counter after the table update
          var sTitle,
            oTable = oEvent.getSource(),
            iTotalItems = oEvent.getParameter("total");
          // only update the counter if the length is final and
          // the table is not empty
          if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
            sTitle = this.getResourceBundle().getText(
              "worklistTableTitleCount",
              [iTotalItems]
            );
          } else {
            sTitle = this.getResourceBundle().getText("worklistTableTitle");
          }
          this.getModel("worklistView").setProperty(
            "/worklistTableTitle",
            sTitle
          );
        },

        /**
         * Event handler when a table item gets pressed
         * @param {sap.ui.base.Event} oEvent the table selectionChange event
         * @public
         */
        onPress: function (oEvent) {
          // The source is the list item that got pressed
          this._showObject(oEvent.getSource());
        },

        /**
         * Event handler for navigating back.
         * We navigate back in the browser history
         * @public
         */
        onNavBack: function () {
          // eslint-disable-next-line sap-no-history-manipulation
          history.go(-1);
        },

        onSearch: function (oEvent) {
          if (oEvent.getParameters().refreshButtonPressed) {
            // Search field's 'refresh' button has been pressed.
            // This is visible if you select any master list item.
            // In this case no new search is triggered, we only
            // refresh the list binding.
            this.onRefresh();
          } else {
            var aTableSearchState = [];
            var sQuery = oEvent.getParameter("query");

            if (sQuery && sQuery.length > 0) {
              aTableSearchState = [
                new Filter("ComplaintCode", FilterOperator.Contains, sQuery),
              ];
            }
            this._applySearch(aTableSearchState);
          }
        },
        onListItemPress: function (oEvent) {
          var oRouter = this.getOwnerComponent().getRouter();
          var sPath = oEvent
            .getSource()
            .getBindingContext()
            .getPath()
            .substr(1);
          console.log(sPath);
          var oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("RouteEditCmp", {
            prop: window.encodeURIComponent(sPath),
          });
        },

        onPressAdd: function (oEvent) {
          var oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("RouteAddCmp");
        },

        /**
         * Event handler for refresh event. Keeps filter, sort
         * and group settings and refreshes the list binding.
         * @public
         */
        onRefresh: function () {
          var oTable = this.byId("table");
          oTable.getBinding("items").refresh();
        },

        /* =========================================================== */
        /* internal methods                                            */
        /* =========================================================== */

        /**
         * Shows the selected item on the object page
         * On phones a additional history entry is created
         * @param {sap.m.ObjectListItem} oItem selected Item
         * @private
         */
        _showObject: function (oItem) {
          this.getRouter().navTo("object", {
            objectId: oItem.getBindingContext().getProperty("Id"),
          });
        },

        /**
         * Internal helper method to apply both filter and search state together on the list binding
         * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
         * @private
         */
        _applySearch: function (aTableSearchState) {
          var oTable = this.byId("table"),
            oViewModel = this.getModel("worklistView");
          oTable.getBinding("items").filter(aTableSearchState, "Application");
          // changes the noDataText of the list in case there are no filter results
          if (aTableSearchState.length !== 0) {
            oViewModel.setProperty(
              "/tableNoDataText",
              this.getResourceBundle().getText("worklistNoDataWithSearchText")
            );
          }
        },
      }
    );
  }
);
