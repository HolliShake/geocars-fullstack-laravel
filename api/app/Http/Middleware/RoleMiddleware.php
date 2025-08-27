<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $user = $request->user();
        if ($role && strlen($role) > 0) {
            $roles = explode(',', $role);
            if (!in_array($user->role, $roles)) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        return $next($request);
    }
}
