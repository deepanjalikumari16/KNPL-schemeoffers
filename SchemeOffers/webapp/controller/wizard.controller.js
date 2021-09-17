sap.ui.define([
    'sap/ui/core/mvc/Controller',
    'sap/ui/core/library',
    "sap/ui/core/ValueState",
    "com/knpl/pragati/SchemeOffers/controller/BaseController",
    "com/knpl/pragati/SchemeOffers/model/customInt",
    "com/knpl/pragati/SchemeOffers/model/cmbxDtype2",
    "com/knpl/pragati/SchemeOffers/model/ArrayDType1",
    "com/knpl/pragati/SchemeOffers/model/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment"

], function (Controller, coreLibrary, ValueState, BaseController, customInt, cmbxDtype2, ArrayDType1, formatter, JSONModel, Fragment) {
    "use strict";

    // shortcut for sap.ui.core.ValueState


    return BaseController.extend("com.knpl.pragati.SchemeOffers.controller.wizard", {
        customInt: customInt,
        cmbxDtype2: cmbxDtype2,
        ArrayDType1: ArrayDType1,
        formatter: formatter,
        _syncSelect: function (sStepId) {
            var oModel = this.getView().getModel();
            oModel.setProperty('/linearWizardSelectedStep', sStepId);
        },

        validateProdInfoStep: function (abc) {
            var oModel = this.getView().getModel(),
                oProdInfoStep = this.getView().byId(abc);
            var aStep = this.getView().byId("ProductTypeStep")
            var aWizard = this.getView().byId("CreateProductWizard")
            oProdInfoStep.setValidated();

            //this.getView().byId("CreateProductWizard").goToStep()
            //aWizard.previouStep()
        },

        onActivate: function (oEvent) {
            var sCurrentStepId = oEvent.getParameter("id");
            sCurrentStepId = sCurrentStepId.split('-').pop();
            var oView = this.getView()

            this._syncSelect(sCurrentStepId);
            // console.log("Step Activated", sCurrentStepId)
            if (sCurrentStepId === 'PricingStep') {
                //this.validateProdInfoStep(sCurrentStepId);

            }
        },
        onInit: function () {




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

        },
        onAfterRendering: function () {
            //console.log("onAfter Rendering");

            this._setWizardlayout2();

        },
        _setWizardlayout1: function () {
            var aStep = this.getView().byId("ProductTypeStep")
            this.getView().byId("CreateProductWizard").setCurrentStep(aStep);
            this.getView().byId("CreateProductWizard").setShowNextButton(true);
        },
        _setWizardlayout2: function () {
            var aStep = this.getView().byId("ProductTypeStep")
            this.getView().byId("CreateProductWizard").goToStep(aStep);
            this.getView().byId("CreateProductWizard").setShowNextButton(false);
        },
        onExit: function () {
            //console.log("on Exit");
        }



    });
});