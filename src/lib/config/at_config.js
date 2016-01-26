function ldapOrUserPass(error, state) {
    if (error && state === 'signIn' //user/pass login failed
        && orion.dictionary.get('ldap.ldap')
        && orion.dictionary.get('ldap.ldap').length !== 0) {

        let username = document.getElementById("at-field-username_and_email").value;
        pass = document.getElementById("at-field-password").value;

        Meteor.loginWithLdap(username, pass, function (err) {
            if (err) {
                let errSpan = $('.at-form .at-error span');
                errSpan.html(`<i class="mdi-alert-warning"></i> ${err.reason}`);
            }
        });
    }
}
// Options
AccountsTemplates.configure({
    // defaultLayout: 'emptyLayout',
    showForgotPasswordLink: true,
    overrideLoginErrors: false,
    enablePasswordChange: true,

    sendVerificationEmail: true,
    // enforceEmailVerification: true,
    confirmPassword: true,
    //continuousValidation: false,
    //displayFormLabels: true,
    forbidClientAccountCreation: false,
    //formValidationFeedback: true,
    homeRoutePath: '/',
    //showAddRemoveServices: false,
    showPlaceholders: true,
    lowercaseUsername: true,
    onSubmitHook: ldapOrUserPass,
    continuousValidation: true,
    negativeValidation: true,
    positiveValidation: true,
    negativeFeedback: false,
    positiveFeedback: true,

    // Privacy Policy and Terms of Use
    //privacyUrl: 'privacy',
    //termsUrl: 'terms-of-use',
});

let pwd = AccountsTemplates.removeField('password');
AccountsTemplates.removeField('email');
AccountsTemplates.addFields([
    {
        _id: "username",
        type: "text",
        displayName: "username",
        required: true,
        minLength: 4
    },
    {
        _id: 'email',
        type: 'email',
        required: true,
        displayName: "email",
        re: /.+@(.+){2,}\.(.+){2,}/,
        errStr: 'Invalid email',
    },
    {
        _id: 'username_and_email',
        type: 'text',
        required: true,
        displayName: "Login",
    },
    pwd
]);

AccountsTemplates.addField({
    _id: "isgroup",
    type: "checkbox",
    displayName: "This is a group/organisational account",
});

AccountsTemplates.addFields([{
    _id: "url",
    type: "text",
    displayName: "Home page"
}, {
    _id: "description",
    type: "text",
    displayName: "A brief description of this account"
}]);
