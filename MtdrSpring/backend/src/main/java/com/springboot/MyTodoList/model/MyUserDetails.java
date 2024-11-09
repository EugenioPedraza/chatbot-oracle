package com.springboot.MyTodoList.model;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;




public class MyUserDetails implements UserDetails {

    private String username;
    private String password;
    private List<GrantedAuthority> authorities;


    public MyUserDetails(Usuario usuario){
        this.username = usuario.getUsername();
        this.password = usuario.getPassword();
        
        if (usuario.isAdmin()){
            this.authorities = Arrays.asList(new SimpleGrantedAuthority("ADMIN"));
        } else {
            this.authorities = Arrays.asList(new SimpleGrantedAuthority("USER"));
        }
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
       return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
       return username;
    }

    @Override
    public boolean isAccountNonExpired() {
       return true;
    }

    @Override
    public boolean isAccountNonLocked() {
       return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
       return true;
    }
    
}
