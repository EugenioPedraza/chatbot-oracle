package com.springboot.MyTodoList.security;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;


@Configuration
@EnableWebSecurity
public class WebSecurityConfiguration extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.csrf().disable();
<<<<<<< HEAD
        httpSecurity.authorizeRequests().anyRequest().permitAll();
=======
        httpSecurity.authorizeRequests().anyRequest().//.authenticated().and().
                //formLogin().and().logout()
                permitAll();
>>>>>>> 76f51340eaa69acac2371286417a894f3c3aba8c
    }
}
