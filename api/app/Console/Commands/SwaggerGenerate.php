<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class SwaggerGenerate extends Command
{
    protected $signature = 'swagger:generate {--mobile} {--yaml}';
    protected $description = 'Generate Swagger JSON/YAML for mobile or dashboard';

    public function handle()
    {
        $apiType = $this->option('mobile') ? 'mobile' : 'dashboard';
        $this->info("Generating Swagger for {$apiType}...");

        // Decide which directories to include
        $directories = 'app/Http/Controllers app/Models';
        $outputJson = 'public/openapi.json';
        $outputYaml = $apiType === 'mobile' ? 'public/openapi.mobile.yaml' : 'public/openapi.yaml';

        // Generate openapi.json
        $this->info('Generating JSON file...');
        $openapiGenerator = base_path('vendor/bin/openapi');
        $generateJsonCommand = sprintf(
            '%s %s -o %s --exclude vendor --exclude test --format json',
            $openapiGenerator,
            $directories,
            $outputJson
        );

        $commandOutput = [];
        exec($generateJsonCommand, $commandOutput);
        $this->info(implode("\n", $commandOutput));

        // Filter JSON based on api-type
        $this->info('Filtering JSON file...');
        $jsonContent = json_decode(file_get_contents($outputJson), true);
        $filteredPaths = [];
        foreach ($jsonContent['paths'] as $path => $methods) {
            foreach ($methods as $method => $details) {
                $annotationType = $details['x-api-type'] ?? 'dashboard';
                if (($apiType === 'mobile' && $annotationType === 'mobile' || $annotationType === 'all')
                    || ($apiType === 'dashboard' && $annotationType !== 'mobile')) {
                    if (!isset($filteredPaths[$path])) {
                        $filteredPaths[$path] = [];
                    }
                    $filteredPaths[$path][$method] = $details;
                }
            }
        }
        $jsonContent['paths'] = $filteredPaths;
        file_put_contents($outputJson, json_encode($jsonContent, JSON_PRETTY_PRINT));

        // Convert to openapi.yaml
        if ($this->option('yaml')) {
            $this->info('Converting to YAML...');
            $swaggerCliCommand = sprintf(
                'npx swagger-cli bundle %s --outfile %s --type yaml',
                $outputJson,
                $outputYaml
            );
            exec($swaggerCliCommand);
        }

        $this->info("Swagger files generated: {$outputJson} and {$outputYaml}");
    }
}
