sap.ui.define(
  [
    "com/knpl/pragati/ContactPainter/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/layout/form/FormElement",
    "sap/m/Input",
    "sap/m/Label",
    "sap/ui/core/library",
    "sap/ui/core/message/Message",
    "sap/m/DatePicker",
    "sap/ui/core/ValueState",
    "com/knpl/pragati/ContactPainter/controller/Validator",
    "sap/ui/model/type/Date",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/format/DateFormat",
    "sap/ui/core/routing/History",
    "com/knpl/pragati/ContactPainter/model/customInt",
    "com/knpl/pragati/ContactPainter/model/cmbxDtype2",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
    BaseController,
    JSONModel,
    MessageBox,
    MessageToast,
    Fragment,
    FormElement,
    Input,
    Label,
    library,
    Message,
    DatePicker,
    ValueState,
    Validator,
    DateType,
    Filter,
    FilterOperator,
    DateFormat,
    History,
    customInt1,
    customInt2
  ) {
    "use strict";

    return BaseController.extend(
      "com.knpl.pragati.ContactPainter.controller.ProfilePainter",
      {
        onInit: function () {
          var oRouter = this.getOwnerComponent().getRouter(this);
          sap.ui.getCore().attachValidationError(function (oEvent) {
            if (oEvent.getParameter("element").getRequired()) {
              oEvent.getParameter("element").setValueState(ValueState.Error);
            } else {
              oEvent.getParameter("element").setValueState(ValueState.None);
            }
          });
          sap.ui.getCore().attachValidationSuccess(function (oEvent) {
            oEvent.getParameter("element").setValueState(ValueState.None);
          });

          oRouter
            .getRoute("RouteProfile")
            .attachMatched(this._onRouteMatched, this);
        },
        _onRouteMatched: function (oEvent) {
          var oProp = window.decodeURIComponent(
            oEvent.getParameter("arguments").prop
          );
          var oView = this.getView();
          var sExpandParam =
            "AgeGroup,Preference/Language,PainterContact,PrimaryDealerDetails,PainterAddress/CityDetails,PainterAddress/StateDetails,PainterSegmentation/TeamSizeDetails,PainterSegmentation/PainterExperienceDetails,PainterSegmentation/SitePerMonthDetails,PainterSegmentation/PotentialDetails ,PainterFamily/RelationshipDetails,PainterBankDetails/AccountTypeDetails,PainterBankDetails/BankNameDetails,Assets/AssetTypeDetails,Dealers,Preference/SecurityQuestion,PainterKycDetails/KycTypeDetails";
          console.log(oProp);
          if (oProp.trim() !== "") {
            oView.bindElement({
              path: "/" + oProp,
              parameters: {
                expand: sExpandParam,
              },
            });
          }
          this._initData(oProp);
        },
        _initData: function (oProp) {
          var oData = {
            modeEdit: false,
            bindProp: oProp,
            iCtbar: true,
            PainterId: oProp.replace(/[^0-9]/g, ""),
          };
          var oModel = new JSONModel(oData);
          this.getView().setModel(oModel, "oModelControl2");
          this._loadEditProfile("Display");
          this._loadEditBanking("Display");
          this._toggleButtonsAndView(false);
          var oDataValue = this.getView()
            .getModel()
            .getObject("/" + oProp, {
              expand:
                "AgeGroup,Preference,PainterContact,PainterAddress,PainterSegmentation,PainterFamily,PainterBankDetails,Assets",
            });

          this._initFilerForTables();
        },
        handleEditPress: function () {
          this._toggleButtonsAndView(true);
          var oView = this.getView();
          var oCtrl2Model = oView.getModel("oModelControl2");
          oCtrl2Model.setProperty("/modeEdit", true);
          oCtrl2Model.setProperty("/iCtbar", false);
          var c1, c2, c3;
          var othat = this;
          c1 = othat._loadEditProfile("Edit");
          c1.then(function () {
            c2 = othat._loadEditBanking("Edit");
            c2.then(function () {
              c3 = othat._initEditData();
              c3.then(function () {
                othat.getView().getModel("oModelView").refresh(true);
                othat._setCopyForFragment();
              });
            });
          });

          // this._initEditData();
          // this._initSaveModel();
        },
        _initEditData: function () {
          var promise = jQuery.Deferred();
          var oView = this.getView();
          var othat = this;
          var oControlModel2 = oView.getModel("oModelControl2");
          var sPath = oControlModel2.getProperty("/bindProp");
          var iPainterId = parseInt(oControlModel2.getProperty("/PainterId"));

          var oDataCtrl = {
            modeEdit: false,
            bindProp: sPath,
            PainterId: iPainterId,
            EditTb1FDL: false,
            EditTb2AST: false,
            AnotherMobField: false,
            BankExistStatus: "",
            AddNewBank: false,
            PainterAddBanDetails: {
              AccountHolderName: "",
              AccountTypeId: "",
              BankNameId: "",
              AccountNumber: "",
              IfscCode: "",
              PainterId: iPainterId,
              Status: "PENDING",
            },
            PainterAddDet: {
              JoiningDate: "",
              StateKey: "",
              Citykey: "",
              DealerId: "",
              SecondryDealer: [],
              SMobile1: "",
              SMobile2: "",
              DOJ: "",
              ConfrmAccNum: "",
            },
          };
          var oControlModel = new JSONModel(oDataCtrl);

          oView.setModel(oControlModel, "oModelControl");

          var oDataValue = oView.getModel().getObject("/" + sPath, {
            expand:
              "AgeGroup,Preference,PainterContact,PainterAddress,PainterSegmentation,PainterFamily,PainterBankDetails,PainterKycDetails,Assets,Dealers",
          });
          // setting the value property for the date this will help in resolving the date validation
          // at the time of calling the validation function

          var oDate = oDataValue["JoiningDate"];
          var oDateFormat = DateFormat.getDateTimeInstance({
            pattern: "dd/MM/yyyy",
          });
          oControlModel.setProperty(
            "/PainterAddDet/JoiningDate",
            oDateFormat.format(oDate)
          );
          // setting up secondry mobile number data
          var iCountContact = 0;
          for (var j of oDataValue["PainterContact"]) {
            if (iCountContact == 0) {
              oControlModel.setProperty("/PainterAddDet/SMobile1", j["Mobile"]);
            } else if (iCountContact == 1) {
              oControlModel.setProperty("/PainterAddDet/SMobile2", j["Mobile"]);
              oControlModel.setProperty("/AnotherMobField", true);
            }
            iCountContact++;
          }

          // setting up Dealers data
          var oDealer = oDataValue["Dealers"];
          var oDealerArray = [];
          for (var i of oDealer) {
            oDealerArray.push(i["Id"]);
          }
          oControlModel.setProperty(
            "/PainterAddDet/SecondryDealer",
            oDealerArray
          );

          // setting up the state/city filtering data
          var oCity = oView.byId("cmbCity"),
            sStateKey = oDataValue["PainterAddress"]["StateId"] || "",
            aFilterCity = [],
            oBindingCity = oCity.getBinding("items");
          if (sStateKey !== "") {
            aFilterCity.push(
              new Filter("StateId", FilterOperator.EQ, sStateKey)
            );
            oBindingCity.filter(aFilterCity);
          }

          // setting up model to the view
          var oNewData = Object.assign({}, oDataValue);

          var oModel = new JSONModel(oDataValue);
          oView.setModel(oModel, "oModelView");
          // setting up the fields data so that the mobile user can also be viewed
          var sReqFields = [
            "Email",
            "Mobile",
            "Name",
            "PainterAddress/AddressLine1",
            "PainterAddress/CityId",
            "PainterAddress/StateId",
            "Preference/SecurityQuestionId",
            "Preference/SecurityAnswer",
            "PainterSegmentation/TeamSizeId",
            "PainterSegmentation/PainterExperience",
            "PainterSegmentation/SitePerMonthId",
            "PainterSegmentation/PotentialId",
            // "PainterBankDetails/IfscCode",
            // "PainterBankDetails/BankNameId",
            // "PainterBankDetails/AccountTypeId",
            // "PainterBankDetails/AccountNumber",
            // "PainterBankDetails/AccountHolderName",
            // "PainterKycDetails/KycTypeId",
            // "PainterKycDetails/GovtId",
          ];
          var sValue = "",
            sPlit;
          for (var k of sReqFields) {
            sValue = oModel.getProperty("/" + k);
            sPlit = k.split("/");
            if (sPlit.length > 1) {
              if (
                toString.call(oModel.getProperty("/" + sPlit[0])) !==
                "[object Object]"
              ) {
                oModel.setProperty("/" + sPlit[0], {});
              }
            }
            if (sValue == undefined) {
              oModel.setProperty("/" + k, "");
            }
          }
          console.log(oModel);
          oModel.refresh(true);
          oControlModel.refresh(true);
          promise.resolve();
          return promise;
        },
        _checkJson: function (mParam) {
          try {
            JSON.parse(mParam);
          } catch (e) {
            return false;
          }
          return true;
        },
        _setCopyForFragment: function () {},
        handleSavePress: function () {
          // this._toggleButtonsAndView(false);
          var oView = this.getView();
          // oView.getModel("oModelControl").setProperty("/modeEdit", false);
          this.onPressSave();
          // this._postDataToSave();
        },
        onPressSave: function () {
          var oView = this.getView();
          var oModelControl = oView.getModel("oModelControl");
          var oModel = oView.getModel("oModelView");
          var oValidator = new Validator();
          var oVbox1 = oView.byId("ObjectPageLayout");
          // var oVbox2 = oView.byId("idVbBanking");
          var bValidation = oValidator.validate(oVbox1, true);
          var cValidation = true; // oValidator.validate(oVbox2);
          var dTbleFamily = !oModelControl.getProperty("/EditTb1FDL");
          var eTbleAssets = !oModelControl.getProperty("/EditTb2AST");

          if (dTbleFamily == false) {
            MessageToast.show(
              "Kindly save the details in the 'Family Details' table to continue."
            );
          }
          if (eTbleAssets == false) {
            MessageToast.show(
              "Kindly save the details in the 'Asset Details' table to continue."
            );
          }
          if (bValidation == false) {
            MessageToast.show(
              "Kindly input all the mandatory(*) fields to continue."
            );
          }
          if (cValidation == false) {
            MessageToast.show(
              "Kindly input all the mandatory(*) fields to continue."
            );
          }

          if (bValidation && dTbleFamily && eTbleAssets && cValidation) {
            this._postDataToSave();
          }
        },

        _postDataToSave: function () {
          var oView = this.getView();
          var oCtrlModel = oView.getModel("oModelControl");
          var oViewModel = this.getView().getModel("oModelView");
          var oViewData = oViewModel.getData();
          var othat = this;
          var oPayload = Object.assign({}, oViewData);
          for (var prop of oPayload["PainterFamily"]) {
            if (prop.hasOwnProperty("editable")) {
              delete prop["editable"];
            }
          }
          for (var prop of oPayload["Assets"]) {
            if (prop.hasOwnProperty("editable")) {
              delete prop["editable"];
            }
          }
          // setting up contact number data
          var aPainterSecContact = [];
          var SMobile1 = JSON.parse(
            JSON.stringify(oCtrlModel.getProperty("/PainterAddDet/SMobile1"))
          );
          var SMobile2 = JSON.parse(
            JSON.stringify(oCtrlModel.getProperty("/PainterAddDet/SMobile2"))
          );
          var aPainterSecContact = [];
          if (SMobile1.trim() !== "") {
            aPainterSecContact.push({ Mobile: SMobile1 });
          }
          if (SMobile2.trim() !== "") {
            aPainterSecContact.push({ Mobile: SMobile2 });
          }
          oPayload["PainterContact"] = aPainterSecContact;

          // dealer data save
          var oSecondryDealer = oCtrlModel.getProperty(
            "/PainterAddDet/SecondryDealer"
          );

          var oDealers = [];
          for (var i of oSecondryDealer) {
            oDealers.push({ Id: parseInt(i) });
          }

          oPayload["Dealers"] = oDealers;

          //removing the empty values from gen data, painteraddress,preference,segmentation
          var oData = this.getView().getModel();
          var sPath = "/" + oCtrlModel.getProperty("/bindProp");
          for (var a in oPayload) {
            if (oPayload[a] === "") {
              oPayload[a] = null;
            }
          }
          for (var b in oPayload["Preference"]) {
            if (oPayload["Preference"][b] === "") {
              oPayload["Preference"][b] = null;
            }
          }
          for (var c in oPayload["PainterSegmentation"]) {
            if (oPayload["PainterSegmentation"][c] === "") {
              oPayload["PainterSegmentation"][c] = null;
            }
          }
          for (var d in oPayload["PainterAddress"]) {
            if (oPayload["PainterAddress"][d] === "") {
              oPayload["PainterAddress"][d] = null;
            }
          }
          console.log(oPayload, sPath);
          oData.update(sPath, oPayload, {
            success: function () {
              MessageToast.show(
                "Painter " + oPayload["Name"] + " Sucessfully Updated"
              );
              othat.handleCancelPress();
              //oData.refresh(true);
            },
            error: function (a) {
              MessageBox.error(
                "Unable to update a painter due to the server issues",
                {
                  title: "Error Code: " + a.statusCode,
                }
              );
            },
          });
        },
        _ReturnObjects: function (mParam) {
          var obj = Object.assign({}, mParam);
          var oNew = Object.entries(obj).reduce(
            (a, [k, v]) => (v === "" ? a : ((a[k] = v), a)),
            {}
          );
          return oNew;
        },
        _initFilerForTables: function () {
          var oView = this.getView();
          var oPainterId = oView
            .getModel("oModelControl2")
            .getProperty("/PainterId");

          var oFilerByRId = new Filter(
            "ReferredBy",
            FilterOperator.EQ,
            oPainterId
          );
          oView.byId("Referral").getBinding("items").filter(oFilerByRId);
          var oFilComplaints = new Filter(
            "Painter/Id",
            FilterOperator.EQ,
            oPainterId
          );
          oView
            .byId("IdTblComplaints")
            .getBinding("items")
            .filter(oFilComplaints);

          var oFilOffers = new Filter(
            "PainterId",
            FilterOperator.EQ,
            oPainterId
          );
          oView
            .byId("idTblOffers")
            .getBinding("items")
            .filter(oFilOffers);

          //IdTblComplaints
        },
        fmtAddress: function (mParam1, mParam2, mParam3) {
          if (mParam1) {
            return mParam1.trim() + ", " + mParam2 + ", " + mParam3;
          } else {
            return mParam2 + ", " + mParam3;
          }
        },
        fmtAgeGrp: function (mParam1) {
          if (mParam1) {
            return mParam1 + " years";
          }
        },
        onPressDealerLink: function (oEvent) {
          var oSource = oEvent.getSource();
          var oView = this.getView();
          if (!this._pPopover) {
            this._pPopover = Fragment.load({
              id: oView.getId(),
              name: "com.knpl.pragati.ContactPainter.view.fragments.Popover",
              controller: this,
            }).then(function (oPopover) {
              oView.addDependent(oPopover);
              return oPopover;
            });
          }
          this._pPopover.then(function (oPopover) {
            oPopover.openBy(oSource);
          });
        },

        onSecMobLinkPress: function () {
          this.getView()
            .getModel("oModelControl")
            .setProperty("/AnotherMobField", true);
        },
        onPrimaryNoChang: function (oEvent) {
          var oSource = oEvent.getSource();
          if (oSource.getValueState() == "Error") {
            return;
          }
          var bFlag = true;
          var sBindValue = "";
          var oSouceBinding = oSource.getBinding("value").getPath();
          var aFieldGroup = sap.ui.getCore().byFieldGroupId("PMobile");

          var oModelView = this.getView().getModel("oModelView");
          for (var i of aFieldGroup) {
            if (oSource.getValue().trim() === "") {
              break;
            }
            if (oSource.getId() === i.getId()) {
              continue;
            }
            if (i.getValue().trim() === oSource.getValue().trim()) {
              bFlag = false;
              sBindValue = i.getBinding("value").getPath();
            }
          }
          var oJson = {
            "/Mobile": "Primary Mobile",
            "/PainterAddDet/SMobile1": "Secondry Mobile",
            "/PainterAddDet/SMobile2": "Secondry Mobile",
          };
          if (!bFlag) {
            oSource.setValue("");
            oModelView.setProperty(oSouceBinding, "");
            MessageToast.show(
              "This mobile number is already entered in " +
                oJson[sBindValue] +
                " kindly eneter a new number"
            );
          }
        },
        onLinkPrimryChange: function (oEvent) {
          var oSource = oEvent.getSource();
          var sSkey = oSource.getSelectedKey();
          var sItem = oSource.getSelectedItem();
          var oView = this.getView();
          var mCmbx = oView.byId("mcmbxDlr").getSelectedKeys();
          var sFlag = true;
          for (var i of mCmbx) {
            if (parseInt(i) == parseInt(sSkey)) {
              sFlag = false;
            }
          }
          if (!sFlag) {
            oSource.clearSelection();
            oSource.setSelectedKey("");
            oSource.setValue("");
            MessageToast.show(
              "Kindly select a different dealer as its already selected as secondry dealer."
            );
          }
        },
        onChangePDealer: function (oEvent) {
          var oSource = oEvent.getSource();
          var sKey = oSource.getSelectedKey();

          if (sKey == "") {
            oSource.setValue("");
            //oSource.removeAssociation("selectedItem")
          }
        },
        secDealerChanged: function (oEvent) {
          var oView = this.getView();
          var sPkey = oView.byId("cmbxPDlr").getSelectedKey();
          var mBox = oEvent.getSource();
          var oItem = oEvent.getParameters()["changedItem"];
          var sSKey = oItem.getProperty("key");
          if (sPkey == sSKey) {
            mBox.removeSelectedItem(oItem);
            mBox.removeSelectedItem(sSKey);
            MessageToast.show(
              oItem.getProperty("text") +
                " is already selected in the Primary Dealer"
            );
          }
        },
        onStateChange: function (oEvent) {
          var sKey = oEvent.getSource().getSelectedKey();
          var oView = this.getView();
          var oCity = oView.byId("cmbCity"),
            oBindingCity,
            aFilter = [],
            oView = this.getView();
          if (sKey !== "") {
            oCity.clearSelection();
            oCity.setValue("");
            oBindingCity = oCity.getBinding("items");
            aFilter.push(new Filter("StateId", FilterOperator.EQ, sKey));
            oBindingCity.filter(aFilter);
          }
        },
        onPressAddFamliy: function () {
          var oView = this.getView();
          var oModel = oView.getModel("oModelView");
          var oFamiDtlMdl = oModel.getProperty("/PainterFamily");
          var bFlag = true;
          if (oFamiDtlMdl.length > 0 && oFamiDtlMdl.length <= 5) {
            for (var prop of oFamiDtlMdl) {
              if (prop.hasOwnProperty("editable")) {
                if (prop["editable"] == true) {
                  bFlag = false;
                  MessageToast.show(
                    "Save or delete the existing data in the table before adding a new data."
                  );
                  return;
                  break;
                }
              }
            }
          }
          if (oFamiDtlMdl.length >= 5) {
            MessageToast.show(
              "We can only add 5 family members. Kinldy remove any existing data to add a new family member."
            );
            bFlag = false;
            return;
          }
          if (bFlag == true) {
            oFamiDtlMdl.push({
              RelationshipId: "",
              Mobile: "",
              Name: "",
              editable: true,
            });
            oView.getModel("oModelControl").setProperty("/EditTb1FDL", true);
            oModel.refresh();
          }
        },
        onPressEditRel: function (oEvent) {
          var oView = this.getView();
          var oModel = oView.getModel("oModelView");
          var oObject = oEvent
            .getSource()
            .getBindingContext("oModelView")
            .getObject();
          oObject["editable"] = true;
          oModel.refresh();
          this._setFDLTbleFlag();
        },
        onPressFDLSave: function (oEvent) {
          var oView = this.getView();
          var oModel = oView.getModel("oModelView");
          var oObject = oEvent
            .getSource()
            .getBindingContext("oModelView")
            .getObject();

          var oTable = oView.byId("idFamilyDetils");
          var oCells = oEvent.getSource().getParent().getParent().getCells();
          var oValidator = new Validator();
          var cFlag = oValidator.validate(oCells);

          var bFlag = true;
          // var cFlag = oValidator.validate();
          var oCheckProp = ["RelationshipId", "Mobile", "Name"];
          for (var abc in oCheckProp) {
            if (oObject[abc] == "") {
              bFlag = false;
              break;
            }
          }

          if (bFlag && cFlag) {
            oObject["editable"] = false;
            oModel.refresh(true);
          } else {
            MessageToast.show(
              "Kindly input 'family details' value in a proper format to continue"
            );
          }
          // oModel.refresh(true);
          this._setFDLTbleFlag();
        },
        onKycChange: function (oEvent) {
          var oModel = this.getView().getModel("oModelView");

          var oView = this.getView();
          if (oEvent.getSource().getSelectedKey() == "") {
            oView.byId("kycIdNo").setValueState("None");
            oModel.setProperty("/PainterKycDetails/GovtId", "");
          }
        },
        fmtLabel: function (mParam1) {
          var oData = this.getView().getModel(),
            oPayload = "";
          if (mParam1 == "") {
            return "Select the KYC to enable the below field.";
          } else if (mParam1 == undefined) {
            return "";
          } else {
            oPayload = oData.getProperty("/MasterKycTypeSet(" + mParam1 + ")");
            return "Enter the " + oPayload["KycType"] + " Number";
          }
        },
        fmtLink: function (mParam1) {
          var sPath = "/MasterRelationshipSet(" + mParam1 + ")";
          var oData = this.getView().getModel().getProperty(sPath);
          if (oData !== undefined && oData !== null) {
            return oData["Relationship"];
          } else {
            return mParam1;
          }
        },
        fmtAsset: function (mParam1) {
          var sPath = "/MasterAssetTypeSet(" + mParam1 + ")";
          var oData = this.getView().getModel().getProperty(sPath);
          if (oData !== undefined && oData !== null) {
            return oData["AssetType"];
          } else {
            return mParam1;
          }
        },
        onPressRemoveRel: function (oEvent) {
          var oView = this.getView();
          var oModel = oView.getModel("oModelView");
          var sPath = oEvent
            .getSource()
            .getBindingContext("oModelView")
            .getPath()
            .split("/");
          var aFamilyDetails = oModel.getProperty("/PainterFamily");
          aFamilyDetails.splice(parseInt(sPath[sPath.length - 1]), 1);
          this._setFDLTbleFlag();
          oModel.refresh();
        },
        _setFDLTbleFlag() {
          var oView = this.getView();
          var oModel = this.getView().getModel("oModelView");
          var oModelControl = oView.getModel("oModelControl");
          var oFamiDtlMdl = oModel.getProperty("/PainterFamily");
          var bFlag = true;
          if (oFamiDtlMdl.length > 0) {
            for (var prop of oFamiDtlMdl) {
              if (prop["editable"] == true) {
                bFlag = false;
                break;
              }
            }
          }
          if (bFlag === false) {
            oModelControl.setProperty("/EditTb1FDL", true);
          } else {
            oModelControl.setProperty("/EditTb1FDL", false);
          }
        },
        onPressAdAsset: function () {
          var oView = this.getView();
          var oModel = oView.getModel("oModelView");
          var oModelControl = oView.getModel("oModelControl");
          var oFamiDtlMdl = oModel.getProperty("/Assets");
          var bFlag = true;
          if (oFamiDtlMdl.length > 0 && oFamiDtlMdl.length <= 5) {
            for (var prop of oFamiDtlMdl) {
              if (prop.hasOwnProperty("editable")) {
                if (prop["editable"] == true) {
                  bFlag = false;
                  MessageToast.show(
                    "Save or delete the existing data in the 'Asset Details' table before adding a new data."
                  );
                  return;
                  break;
                }
              }
            }
          }
          if (oFamiDtlMdl.length >= 5) {
            MessageToast.show(
              "We can only add 5 assets. Kinldy remove any existing data to add a new asset."
            );
            bFlag = false;
            return;
          }
          if (bFlag == true) {
            oFamiDtlMdl.push({
              AssetTypeId: "",
              AssetName: "",
              editable: true,
            });
            oModelControl.setProperty("/EditTb2AST", true);
            oModel.refresh();
          }
        },
        onAssetEdit: function (oEvent) {
          var oView = this.getView();
          var oModel = oView.getModel("oModelView");
          var oObject = oEvent
            .getSource()
            .getBindingContext("oModelView")
            .getObject();
          oObject["editable"] = true;

          oModel.refresh();
          this._setASTTbleFlag();
        },
        onAsetSave: function (oEvent) {
          var oView = this.getView();
          var oModel = oView.getModel("oModelView");
          var oObject = oEvent
            .getSource()
            .getBindingContext("oModelView")
            .getObject();
          var bFlag = true;
          var oCells = oEvent.getSource().getParent().getParent();
          var oValidator = new Validator();
          var cFlag = oValidator.validate(oCells);
          var oCheckProp = ["AssetTypeId", "AssetName"];
          for (var abc in oCheckProp) {
            if (oObject[abc] == "") {
              bFlag = false;
              MessageToast.show(
                "Kindly enter the complete deatils before saving."
              );
              break;
            }
          }

          if (bFlag == true && cFlag == true) {
            oObject["editable"] = false;
          } else {
            MessageToast.show(
              "Kindly input 'asset' values in porper format to save."
            );
          }
          oModel.refresh(true);
          this._setASTTbleFlag();
        },

        onPressRemoveAsset: function (oEvent) {
          var oView = this.getView();
          var oModel = oView.getModel("oModelView");
          var sPath = oEvent
            .getSource()
            .getBindingContext("oModelView")
            .getPath()
            .split("/");
          var aFamilyDetails = oModel.getProperty("/Assets");
          aFamilyDetails.splice(parseInt(sPath[sPath.length - 1]), 1);
          this._setASTTbleFlag();
          oModel.refresh();
        },
        _setASTTbleFlag: function () {
          var oView = this.getView();
          var oModelControl = oView.getModel("oModelControl");
          var oModel = this.getView().getModel("oModelView");
          var oFamiDtlMdl = oModel.getProperty("/Assets");
          var bFlag = true;
          if (oFamiDtlMdl.length > 0) {
            for (var prop of oFamiDtlMdl) {
              if (prop["editable"] == true) {
                bFlag = false;
                break;
              }
            }
          }
          if (bFlag === false) {
            oModelControl.setProperty("/EditTb2AST", true);
          } else {
            oModelControl.setProperty("/EditTb2AST", false);
          }
        },
        onPrimaryAcChange: function (oEvent) {
          var oView = this.getView();
          var oSource = oEvent.getSource();
          var oSourceVal = oSource.getValue().trim();
          var oSecAccNo = oView.byId("IdPrAbCnfAccNo");
          var sSecAccVal = oSecAccNo.getValue().trim();
          if (sSecAccVal === "") {
            return;
          } else {
            MessageToast.show(
              "Kindly enter the same account number in the 'Confirm Account Number' field."
            );
            oSecAccNo.setValue("");
          }
        },
        onConfAccChng: function (oEvent) {
          var oView = this.getView();
          var oPrimAcNum = oView.byId("IdPrAbAccountNumber");
          var oSecNumber = oEvent.getSource().getValue();
          if (oSecNumber.trim() !== oPrimAcNum.getValue().trim()) {
            MessageToast.show(
              "Account Number doesn't match, kindly enter it again."
            );
            oEvent.getSource().setValue("");
          }
        },
        fmtBankStatus: function (mParam) {
          if (mParam == "APPROVED") {
            return 0;
          } else if (mParam == "REJECT") {
            return 1;
          }
        },
        onRbBankStatus: function (oEvent) {
          var iIndex = oEvent.getSource().getSelectedIndex();
          var oView = this.getView();
          var oModelView = oView.getModel("oModelView");

          if (iIndex == 0) {
            oModelView.setProperty("/PainterBankDetails/Status", "APPROVED");
          } else if (iIndex == 1) {
            oModelView.setProperty("/PainterBankDetails/Status", "REJECT");
          }
          console.log(oModelView);
        },
        onRbKycStatus: function (oEvent) {
          var iIndex = oEvent.getSource().getSelectedIndex();
          var oView = this.getView();
          var oModelView = oView.getModel("oModelView");

          if (iIndex == 0) {
            oModelView.setProperty("/PainterKycDetails/Status", "APPROVED");
          } else if (iIndex == 1) {
            oModelView.setProperty("/PainterKycDetails/Status", "REJECT");
          }
        },
        onAddNewBank: function (oEvent) {
          var oView = this.getView();
          var oModelCtrl = oView.getModel("oModelControl");
          var oProp = oModelCtrl.getProperty("/AddNewBank");
          oModelCtrl.setProperty("/AddNewBank", true);
        },
        onAddCanNewBank: function () {
          var oView = this.getView();
          var oModelCtrl = oView.getModel("oModelControl");
          var oProp = oModelCtrl.getProperty("/AddNewBank");
          oModelCtrl.setProperty("/AddNewBank", false);
          var aFields = [
            "IfscCode",
            "BankNameId",
            "AccountTypeId",
            "AccountNumber",
            "AccountHolderName",
          ];
          var oBject;
          aFields.forEach(function (a) {
            oBject = oView.byId("IdPrAb" + a);
            oBject.setValueState("None");
            oBject.setValue("");
            oModelCtrl.setProperty("/PainterAddBanDetails/" + a, "");
          });

          //confirm account number field reset values
          var oConfAcc = oView.byId("IdPrAbCnfAccNo");
          oConfAcc.setValue("");
          oConfAcc.setValueState("None");
          oModelCtrl.setProperty("/PainterAddDet/ConfrmAccNum", "");
        },
        fmtLowerCase: function (mParam) {
          var sLetter = "";
          if (mParam) {
            sLetter = mParam
              .toLowerCase()
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");
          }

          return sLetter;
        },

        _save: function () {
          var oModel = this.getView().getModel("oModelView");
        },
        dealerName: function (mParam) {
          return mParam.length;
        },
        _loadEditProfile: function (mParam) {
          var promise = jQuery.Deferred();
          var oView = this.getView();
          var othat = this;
          var oVboxProfile = oView.byId("idVbProfile");
          var sFragName = mParam == "Edit" ? "EditProfile" : "Profile";
          oVboxProfile.destroyItems();
          return Fragment.load({
            id: oView.getId(),
            controller: othat,
            name: "com.knpl.pragati.ContactPainter.view.fragments." + sFragName,
          }).then(function (oControlProfile) {
            oView.addDependent(oControlProfile);
            oVboxProfile.addItem(oControlProfile);
            promise.resolve();
            return promise;
          });
        },
        _loadEditBanking: function (mParam) {
          var promise = jQuery.Deferred();
          var oView = this.getView();
          var othat = this;
          var oVboxProfile = oView.byId("idVbBanking");
          var sFragName = mParam == "Edit" ? "EditBanking" : "Banking";
          oVboxProfile.destroyItems();
          return Fragment.load({
            id: oView.getId(),
            controller: othat,
            name: "com.knpl.pragati.ContactPainter.view.fragments." + sFragName,
          }).then(function (oControlProfile) {
            oView.addDependent(oControlProfile);
            oVboxProfile.addItem(oControlProfile);
            promise.resolve();
            return promise;
          });
        },

        handleCancelPress: function () {
          this._toggleButtonsAndView(false);
          var oView = this.getView();
          var oCtrlModel2 = oView.getModel("oModelControl2");
          oCtrlModel2.setProperty("/modeEdit", false);
          oCtrlModel2.setProperty("/iCtbar", true);
          this._loadEditProfile("Display");
          this._loadEditBanking("Display");
          oView.getModel().refresh(true);
        },

        _toggleButtonsAndView: function (bEdit) {
          var oView = this.getView();

          // Show the appropriate action buttons
          oView.byId("edit").setVisible(!bEdit);
          oView.byId("save").setVisible(bEdit);
          oView.byId("cancel").setVisible(bEdit);

          // Set the right form type
          // this._showFormFragment(bEdit ? "Change" : "Display");
        },
        _showFormFragment: function (sFragmentName) {
          // var oPage = this.byId("page");
          // oPage.removeAllContent();
          // this._getFormFragment(sFragmentName).then(function (oVBox) {
          //     oPage.insertContent(oVBox);
          // });
        },
        _getFormFragment: function (sFragmentName) {
          var pFormFragment = this._formFragments[sFragmentName],
            oView = this.getView();

          if (!pFormFragment) {
            pFormFragment = Fragment.load({
              id: oView.getId(),
              name:
                "sap.ui.layout.sample.SimpleForm354wideDual." + sFragmentName,
            });
            this._formFragments[sFragmentName] = pFormFragment;
          }

          return pFormFragment;
        },
        onNavBack: function (oEvent) {
          var oHistory = History.getInstance();
          var sPreviousHash = oHistory.getPreviousHash();

          if (sPreviousHash !== undefined) {
            window.history.go(-1);
          } else {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RoutePList", {}, true);
          }
        },
      }
    );
  }
);
