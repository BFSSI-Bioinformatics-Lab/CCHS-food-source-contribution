function registerTranslation(resources){
    i18next.use(i18nextBrowserLanguageDetector).init({
        fallbackLng: "en",
        detection: {
            order: ['querystring', 'htmlTag', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'path', 'subdomain'],
        },
        resources: resources
    })
    i18next.changeLanguage();
}

function translateText (key, args){
    return i18next.t(key, args)
}