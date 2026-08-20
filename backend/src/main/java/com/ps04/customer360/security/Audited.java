package com.ps04.customer360.security;

import java.lang.annotation.*;

/**
 * Marks a controller method to be automatically audit-logged by AuditAspect.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Audited {
    String action();
    String targetType() default "";
}
