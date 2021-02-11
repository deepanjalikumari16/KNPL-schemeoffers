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
    FilterOperator
  ) {
    "use strict";

    return BaseController.extend(
      "com.knpl.pragati.ContactPainter.controller.AddEditPainter",
      {
        onInit: function () {
          var oRouter = this.getOwnerComponent().getRouter();
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
            .getRoute("RouteAddEditP")
            .attachMatched(this._onRouteMatched, this);
          this._ValueState = library.ValueState;
          this._MessageType = library.MessageType;
        },
        _onRouteMatched: function (oEvent) {
          var sArgMode = oEvent.getParameter("arguments").mode;
          var sArgId = window.decodeURIComponent(
            oEvent.getParameter("arguments").id
          );

          this._initData(sArgMode, sArgId);
        },
        _initData: function (mParMode, mKey) {
          var oViewModel = new JSONModel({
            sIctbTitle: mParMode == "add" ? "Add" : "Edit",
            busy: false,
            mPainterKey: mKey,
            mode: mParMode,
            edit: mParMode == "add" ? false : true,
            PainterDetails: {
              Mobile: "9891761199",
              AgeGroupId: 1,
              Name: "Manik Saluja",
              Email: "manik093@gmail.com",
              DOB: null,
            },
            Preference: {
              LanguageId: 2,
              SecurityQuestionId: 4,
              SecurityAnswer: "Securtiy Answer",
            },
            PainterAddDet: {
              SecondryDealer: [],
              DealerId: 2,
              StateKey: 1,
              Citykey: "",
              TeamSizeKey: 1,
              SMobile1: "989176119",
              DOB:""
            },
            PainterAddress: {
              AddressLine1: "AddressLine1",
              City: null,
              State: null,
            },
            PainterSegmentation: {
              TeamSize: "",
              PainterExperience: 3,
              SitesPerMonth: 3,
              Potential: "potential",
            },
            SegmentationDetails: {
              TimeSize: "",
              Experiences: "",
              SitesPerMonth: "",
              Potential: "",
            },
            PainterFamily: [],
            PainterAssets: [],
            PainterBankDetails: {
              AccountHolderName: "Account Holder Name",
              AccountType: "Saving",
              BankName: "Purvanchal Bank",
              AccountNumber: "500095756765",
              IfscCode: "IFSCCODE276576",
            },
            PainterKycDetails: {
              KYCStatus: "",
              AadhaarCardNo: "",
            },
            addData: {
              Name: "",
              //City: "",
              Mobile: "",
              //State: "",
              Email: "",
            },
            //valueState: "None",
            addProps: ["Name", "Mobile", "DOB", "Email"],
          });
          //   var oViewModel2 = new JSONModel({
          //     busy: true,
          //     delay: 0,
          //   });
          if (mParMode == "add") {
            this._showFormFragment("AddPainter");
            this.getView().unbindElement();
          } else {
            // this.getView().bindElement("/" + mKey, {
            //   expand: "PainterAddress",
            // });
            // this._showFormFragment("EditPainter");
          }

          this._formFragments; //used for the fragments of the add and edit forms
          this.getView().setModel(oViewModel, "oModelView");
          //this._initMessage(oViewModel);
          this.getView().getModel().resetChanges();
          //used to intialize the message class for displaying the messages
        },
        onPressSave: function () {
          var oValidator = new Validator();
          var oVbox = this.getView().byId("idVbx");
          var bValidation = oValidator.validate(oVbox);

          console.log(bValidation);

          var oViewModel = this.getView().getModel("oModelView");
          var oPainterData =Object.assign({}, oViewModel.getProperty("/PainterDetails"));


          //Getting the Data for Preferrences
          var oPreferrence = JSON.parse(
            JSON.stringify(oViewModel.getProperty("/Preference"))
          );
          //Getting the additional contact information of the painter
          var SMobile1 = JSON.parse(
            JSON.stringify(oViewModel.getProperty("/PainterAddDet/SMobile1"))
          );
          var aPainterSecContact = [];
          aPainterSecContact.push({ Mobile: SMobile1 });
          //Getting the data for the PainterAddress
          var oPainterAddress = JSON.parse(
            JSON.stringify(oViewModel.getProperty("/PainterAddress"))
          );
          var oPainterSeg = JSON.parse(
            JSON.stringify(oViewModel.getProperty("/PainterSegmentation"))
          );
          // Getting the Family Details
          var oPtrFamily = JSON.parse(
            JSON.stringify(oViewModel.getProperty("/PainterFamily"))
          ).map((item) => {
            delete item.editable;
            return item;
          });

          //Getting the Assets Data
          var oPayloadDevice = JSON.parse(
            JSON.stringify(oViewModel.getProperty("/PainterAssets"))
          ).map((item) => {
            delete item.editable;
            return item;
          });

          //Getting the Dealer's Data
          var oSecMainDealers = JSON.parse(
            JSON.stringify(
              oViewModel.getProperty("/PainterAddDet/SecondryDealer")
            )
          );
          var sPrimaryDealerId = JSON.parse(
            JSON.stringify(oViewModel.getProperty("/PainterAddDet/DealerId"))
          );
          var oDealers = [];
          for (var i of oSecMainDealers) {
            oDealers.push({
              Id: parseInt(i),
            });
          }
          oDealers.push({ Id: sPrimaryDealerId });

          // creating the set for the banking details
          var oBankingPayload = JSON.parse(
            JSON.stringify(oViewModel.getProperty("/PainterBankDetails"))
          );

          var oPayload = Object.assign(
            {
              PainterAddress: oPainterAddress,
              PainterContact: aPainterSecContact,
              Preference: oPreferrence,
              Dealers: oDealers,
              PainterSegmentation: oPainterSeg,
              PainterFamily: oPtrFamily,
              Assets: oPayloadDevice,
              PainterBankDetails: oBankingPayload,
            },
            oPainterData
          );
          console.log(oPayload, oViewModel);
          var oData = this.getView().getModel();
          oData.create("/PainterSet", oPayload, {
            success: function () {
              console.log("success");
            },
            error: function () {
              console.log("error");
            },
          });
        },
        _ReturnObjects:function(mParam){
            var object =  Object.assign({}, mParam);
         


        },
        onAfterRendering: function () {
          //var oModel = this.getView().getModel("oModelView");
          //this._initMessage(oModel);
        },
        _initMessage: function (oViewModel) {
          this._onClearMgsClass();
          this._oMessageManager = sap.ui.getCore().getMessageManager();
          var oView = this.getView();
          console.log(this._oMessageManager.getMessageModel());
          oView.setModel(this._oMessageManager.getMessageModel(), "message");
          this._oMessageManager.registerObject(oView, true);
        },
        navPressBack: function () {
          this.getOwnerComponent().getRouter().navTo("RoutePList");
        },
        _showFormFragment: function (sFragmentName) {
          var objSection = this.getView().byId("oVbxSmtTbl");
          var oView = this.getView();
          objSection.destroyItems();

          this._getFormFragment(sFragmentName).then(function (oVBox) {
            oView.addDependent(oVBox);
            objSection.addItem(oVBox);
            //console.log(oView.byId("dpicker").setMinDate(new Date(2016, 0, 1)));
          });
        },
        _getFormFragment: function (sFragmentName) {
          var oView = this.getView();
          var othat = this;
          // if (!this._formFragments) {
          this._formFragments = Fragment.load({
            id: oView.getId(),
            name:
              "com.knpl.pragati.ContactPainter.view.fragments." + sFragmentName,
            controller: othat,
          }).then(function (oFragament) {
            return oFragament;
          });
          // }

          return this._formFragments;
        },
        onStateChange: function (oEvent) {
          var sKey = oEvent.getSource().getSelectedKey() + "";
          var oCity,
            aFilter = [],
            oView = this.getView();
          if (sKey !== "") {
            oView
              .getModel("oModelView")
              .setProperty("/PainterAddress/City", null);
            oCity = oView.byId("cmbCity").getBinding("items");
            aFilter.push(new Filter("StateId", FilterOperator.EQ, sKey));
            oCity.filter(aFilter);
          }
        },
        onPressAddFamliy: function () {
          var oModel = this.getView().getModel("oModelView");
          oModel.getProperty("/PainterFamily").push({
            RelationshipId: null,
            Mobile: "",
            Name: "",
            editable: true,
          });
          oModel.refresh();
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
        },
        onPressFDLSave: function (oEvent) {
          var oView = this.getView();
          var oModel = oView.getModel("oModelView");
          var oObject = oEvent
            .getSource()
            .getBindingContext("oModelView")
            .getObject();
          oObject["editable"] = false;
          oModel.refresh();
          console.log(oModel);
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
          oModel.refresh();
          console.log(sPath);
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
        },
        onPressAdAsset: function () {
          console.log("asset");
          var oModel = this.getView().getModel("oModelView");
          oModel.getProperty("/PainterAssets").push({
            Id: "",
            AssetName: "",
            editable: true,
          });
          oModel.refresh();
        },
        onAsetSave: function (oEvent) {
          var oView = this.getView();
          var oModel = oView.getModel("oModelView");
          var oObject = oEvent
            .getSource()
            .getBindingContext("oModelView")
            .getObject();
          oObject["editable"] = false;
          oModel.refresh();
        },

        onPressRemoveAsset: function (oEvent) {
          var oView = this.getView();
          var oModel = oView.getModel("oModelView");
          var sPath = oEvent
            .getSource()
            .getBindingContext("oModelView")
            .getPath()
            .split("/");
          var aFamilyDetails = oModel.getProperty("/PainterAssets");
          aFamilyDetails.splice(parseInt(sPath[sPath.length - 1]), 1);
          oModel.refresh();
          console.log(sPath);
        },
        // myFactory: function (sId, oContext) {
        //   var sEdit = oContext.getModel().getProperty("/mode");
        //   var object = oContext.getObject();
        //   console.log(
        //     "1{oModelView>" +
        //       oContext.getModel().getProperty(oContext.getPath())["value"] +
        //       "}"
        //   );
        //   var oSmartControl;
        //   if (object["aggregationType"] == "Input") {
        //     oSmartControl = new FormElement({
        //       label: "{?}",
        //       fields: [
        //         new Input({
        //           required: "{oModelView>required}",
        //           fieldGroupIds: "InpGoup",
        //           type: "{oModelView>type}",

        //           placeholder: "{oModelView>placeholder}",
        //           value:
        //             sEdit == "add"
        //               ? "{oModelView>/addData/" +
        //                 oContext.getModel().getProperty(oContext.getPath())[
        //                   "value"
        //                 ] +
        //                 "}"
        //               : "{" +
        //                 oContext.getModel().getProperty(oContext.getPath())[
        //                   "value"
        //                 ] +
        //                 "}",
        //         }),
        //       ],
        //     });
        //   } else if (object["aggregationType"] == "Date") {
        //     console.log(
        //       oContext.getModel().getProperty(oContext.getPath())["value"]
        //     );

        //     oSmartControl = new FormElement({
        //       label: "{oModelView>label}",
        //       fields: [
        //         new DatePicker({
        //           required: "{oModelView>required}",
        //           fieldGroupIds: "InpGoup",
        //           placeholder: "{oModelView>placeholder}",
        //           displayFormat: "long",
        //           dateValue:
        //             sEdit == "add"
        //               ? "{oModelView>/addData/" +
        //                 oContext.getModel().getProperty(oContext.getPath())[
        //                   "value"
        //                 ] +
        //                 "}"
        //               : "{" +
        //                 oContext.getModel().getProperty(oContext.getPath())[
        //                   "value"
        //                 ] +
        //                 "}",
        //         }),
        //       ],
        //     });
        //   }

        //   return oSmartControl;
        // },
        //adding the code for the valuehelp

        // onSuccessPress: function (msg) {
        //   var oMessage = new Message({
        //     message: msg,
        //     type: this._MessageType.Success,
        //     target: "/Dummy",
        //     processor: this.getView().getModel(),
        //   });
        //   sap.ui.getCore().getMessageManager().addMessages(oMessage);
        // },
        // onErrorPress: function () {
        //   var oMessage,
        //     oView = this.getView(),
        //     oViewModel = oView.getModel("oModelView"),
        //     oDataModel = oView.getModel(),
        //     sElementBPath = "";
        //   var othat = this;
        //   var sCheckAdd = oViewModel.getProperty("/mode");
        //   if (sCheckAdd !== "add") {
        //     sElementBPath = oView.getElementBinding().getPath();
        //   }

        //   console.log(this._ErrorMessages);
        //   for (var oProp of this._ErrorMessages) {
        //     oMessage = new sap.ui.core.message.Message({
        //       message: oProp["message"],
        //       type: othat._MessageType.Error,
        //       target:
        //         sCheckAdd == "add"
        //           ? oProp["target"]
        //           : sElementBPath + "/" + oProp["target"],
        //       processor: sCheckAdd == "add" ? oViewModel : oDataModel,
        //     });
        //     othat._oMessageManager.addMessages(oMessage);
        //   }
        // },
        // handleEmptyFields: function (oEvent) {
        //   this.onErrorPress();
        // },
        // validateEventFeedbackForm: function (requiredInputs) {
        //   this._ErrorMessages = [];
        //   var aArray = [];
        //   var othat = this;
        //   var valid = true;
        //   requiredInputs.forEach(function (input) {
        //     var sInput = input;

        //     if (
        //       sInput.getValue().trim() === "" &&
        //       sInput.getRequired() === true
        //     ) {
        //       valid = false;
        //       sInput.setValueState("Error");
        //       othat._ErrorMessages.push({
        //         message:
        //           sInput.getParent().getLabel().getText() +
        //           " is a mandatory field (*)",
        //         target: sInput.getBinding("value").getPath(),
        //       });
        //     } else {
        //       sInput.setProperty("valueState", "None");
        //     }
        //   });
        //   console.log(this._ErrorMessages);
        //   return valid;
        // },
        // _getMessagePopover: function () {
        //   var oView = this.getView();
        //   // create popover lazily (singleton)
        //   if (!this._pMessagePopover) {
        //     this._pMessagePopover = Fragment.load({
        //       id: oView.getId(),
        //       name: "com.knpl.pragati.ContactPainter.view.MessagePopover",
        //     }).then(function (oMessagePopover) {
        //       oView.addDependent(oMessagePopover);
        //       return oMessagePopover;
        //     });
        //   }
        //   return this._pMessagePopover;
        // },
        // onMessagePopoverPress: function (oEvent) {
        //   var oSourceControl = oEvent.getSource();
        //   this._getMessagePopover().then(function (oMessagePopover) {
        //     oMessagePopover.openBy(oSourceControl);
        //   });
        // },
        _onClearMgsClass: function () {
          // does not remove the manually set ValueStateText we set in onValueStatePress():
          //this._clearPress;
          sap.ui.getCore().getMessageManager().removeAllMessages();
        },

        onPressSave1: function () {
          this._onClearMgsClass();
          var requiredInputs = sap.ui.getCore().byFieldGroupId("InpGoup");
          var passedValidation = this.validateEventFeedbackForm(requiredInputs);
          if (passedValidation === false) {
            //show an error message, rest of code will not execute.
            //this.handleEmptyFields();
            return false;
          }
          if (this.getView().getModel("oModelView").getProperty("/edit")) {
            this._saveEdit();
          } else {
            this._saveAdd();
          }
        },
        _saveEdit: function () {
          var oDataModel = this.getView().getModel();
          var oView = this.getView();
          var oModelView = oView.getModel("oModelView");
          oModelView.setProperty("/busy", true);
          var sEntityPath = oView.getElementBinding().getPath();
          var oDataValue = oDataModel.getObject(sEntityPath, {
            expand: "PainterAddress",
          });
          var oPrpReq = oModelView.getProperty("/prop2");
          var oPayload = {
            Name: oDataValue["Name"],
            Mobile: oDataValue["Mobile"],
            Email: oDataValue["Email"],
            //State: oDataValue["PainterAddress"]["City"],
            //City: oDataValue["PainterAddress"]["City"],
          };

          console.log(oPayload, sEntityPath);
          oDataModel.update(sEntityPath, oPayload, {
            success: function (data) {
              oModelView.setProperty("/busy", false);
              MessageToast.show("Painter Sucessfully updated.");
            },
            error: function (data) {
              oModelView.setProperty("/busy", false);
              MessageBox.error("Unable to upadte the printer");
            },
          });
          console.log();
        },
        _saveAdd: function () {
          var oView = this.getView();
          var oModelView = oView.getModel("oModelView");
          oModelView.setProperty("/busy", true);
          var oDataModel = oView.getModel();
          var oRouter = this.getOwnerComponent().getRouter();
          var oMdlView = oView.getModel("oModelView");
          var sEntity = "/PainterSet"; //PainterSet";//PainterRegistrationSet
          var aPayload = oMdlView.getProperty("/addData");
          oDataModel.create(sEntity, aPayload, {
            success: function (data) {
              oModelView.setProperty("/busy", false);
              MessageToast.show(
                "Painter " + aPayload["Name"] + " Successfully Created."
              );
              oRouter.navTo("RoutePList");
            },
            error: function () {
              oModelView.setProperty("/busy", false);
              MessageBox.error("Unable to add the printer");
            },
          });
        },
        onExit: function () {
          console.log("manik exit");
        },
      }
    );
  }
);
