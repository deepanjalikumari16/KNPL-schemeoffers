sap.ui.define(["./BaseController","sap/ui/model/json/JSONModel","sap/ui/core/routing/History","../model/formatter"],function(e,t,s,o){"use strict";return e.extend("com.knpl.pragati.Manage_FAQ.controller.Object",{formatter:o,onInit:function(){var e,s=new t({busy:true,delay:0});this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched,this);this.getRouter().getRoute("createObject").attachPatternMatched(this._onCreateObjectMatched,this);e=this.getView().getBusyIndicatorDelay();this.setModel(s,"objectView");this.getOwnerComponent().getModel().metadataLoaded().then(function(){s.setProperty("/delay",e)})},onNavBack:function(){var e=s.getInstance().getPreviousHash();if(e!==undefined){history.go(-1)}else{this.getRouter().navTo("worklist",{},true)}},onAfterRendering:function(){this._initMessage()},_onObjectMatched:function(e){this.getModel("objectView").setProperty("/sMode","E");this.getModel("objectView").setProperty("/busy",true);var t=e.getParameter("arguments").objectId;this.getModel().metadataLoaded().then(function(){var e=this.getModel().createKey("/MasterFAQSet",{Id:t});this.getModel().read(e,{success:this._setView.bind(this)})}.bind(this))},_onCreateObjectMatched:function(){this.getModel("objectView").setProperty("/sMode","C");this.getModel("objectView").setProperty("/busy",true);this._setView()},_setView:function(e){this._oMessageManager.removeAllMessages();var t=this.getModel("objectView");t.setProperty("/busy",false);this._pendingDelOps=[];if(e){t.setProperty("/oDetails",e);return}t.setProperty("/oDetails",{FAQCategoryId:null,Question:"",Answer:""})},_initMessage:function(){var e=this.getModel("objectView");this._oMessageManager=sap.ui.getCore().getMessageManager();this._oMessageManager.registerMessageProcessor(e)},onCancel:function(){this.getRouter().navTo("worklist",true)},onSave:function(){debugger;this._oMessageManager.removeAllMessages();var e=this.getModel("objectView");var t=e.getProperty("/oDetails"),s=this._fnValidation(t);if(s.IsNotValid){this.showError(this._fnMsgConcatinator(s.sMsg));return}e.setProperty("/busy",true);this.CUOperation(t)},_fnValidation:function(e){var t={IsNotValid:false,sMsg:[]},s=[];if(!e.FAQCategoryId){t.IsNotValid=true;t.sMsg.push("MSG_VALDTN_ERR_FAQCATEGORYID");s.push({message:"MSG_VALDTN_ERR_FAQCATEGORYID",target:"/oDetails/FAQCategoryId"})}else if(!e.Question){t.IsNotValid=true;t.sMsg.push("MSG_VALDTN_ERR_QUESTION");s.push({message:"MSG_VALDTN_ERR_QUESTION",target:"/oDetails/Question"})}else if(!e.Answer){t.IsNotValid=true;t.sMsg.push("MSG_VALDTN_ERR_ANSWER");s.push({message:"MSG_VALDTN_ERR_ANSWER",target:"/oDetails/Answer"})}if(s.length)this._genCtrlMessages(s);return t},_genCtrlMessages:function(e){var t=this,s=t.getModel("objectView");e.forEach(function(e){t._oMessageManager.addMessages(new sap.ui.core.message.Message({message:t.getResourceBundle().getText(e.message),type:sap.ui.core.MessageType.Error,target:e.target,processor:s,persistent:true}))})},_fnMsgConcatinator:function(e){var t=this;return e.map(function(e){return t.getResourceBundle().getText(e)}).join("")},CUOperation:function(e){var t=this.getModel("objectView");e.FAQCategoryId=parseInt(e.FAQCategoryId);var s=$.extend(true,{},e),o=this;debugger;return new Promise(function(e,r){if(t.getProperty("/sMode")==="E"){var a=o.getModel().createKey("/MasterFAQSet",{Id:s.Id});o.getModel().update(a,s,{success:function(){t.setProperty("/busy",false);o.getRouter().navTo("worklist",true);o.showToast.call(o,"MSG_SUCCESS_UPDATE");e(s)},error:function(){t.setProperty("/busy",false);r()}})}else{o.getModel().create("/MasterFAQSet",s,{success:function(s){t.setProperty("/busy",false);o.getRouter().navTo("worklist",true);o.showToast.call(o,"MSG_SUCCESS_CREATE");e(s)},error:function(){t.setProperty("/busy",false);r()}})}})}})});