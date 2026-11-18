<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class CreateAdmin extends Command
{
    protected $signature = 'admin:create
        {email : Admin login email}
        {--name=Admin : Display name}
        {--phone= : Phone number}
        {--password= : Password (prompted if omitted)}';

    protected $description = 'Create or update an admin user (safe for production, touches nothing else)';

    public function handle(): int
    {
        $password = $this->option('password') ?: $this->secret('Password (min 8 characters)');

        if (! is_string($password) || strlen($password) < 8) {
            $this->error('Password must be at least 8 characters.');

            return self::FAILURE;
        }

        User::query()->updateOrCreate(
            ['email' => $this->argument('email')],
            [
                'name' => $this->option('name'),
                'phone' => $this->option('phone') ?: null,
                'password' => $password,
                'is_admin' => true,
            ],
        );

        $this->info('Admin ready: '.$this->argument('email'));

        return self::SUCCESS;
    }
}
