/* global angular*/
angular.module("eresApp").constant("CONFIG", {

    // The url of your domain, both HTTP and HTTPS are supported.
    site_url: "http://eres.scit.pt/wp-json/",
    
    /**
     * toggle for developer mode
     */
    debugger_mode: true,
    
    //post per page count
    post_per_page: 6,
    
    //radio base url
    radio_url: "http://stream.dancewave.online:8080/dance.mp3"

});
