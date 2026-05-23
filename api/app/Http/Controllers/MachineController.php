<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

#[OA\PathItem(
    path: "/machine"
)]
class MachineController extends Controller
{
    #[OA\Get(
        path: "/api/Machine/info",
        summary: "Get machine hardware and system information",
        tags: ["Machine"],
        description: "Retrieve detailed statistics regarding the host operating system, memory metrics, and CPU metrics.",
        operationId: "getMachineInfo"
    )]
    #[OA\Response(
        response: 200,
        description: "Successful operation",
        content: new OA\JsonContent(
            type: "object",
            required: ["HOSTOS", "TotalRam", "AvailableRam", "CpuVendor", "CpuModel", "CpuSpeed", "CpuUtilization"],
            properties: [
                new OA\Property(property: "HOSTOS", description: "Detailed Operating System version string", type: "string", example: "Ubuntu 24.04 LTS"),
                new OA\Property(property: "TotalRam", description: "Total available system RAM in MB", type: "integer", example: 16384),
                new OA\Property(property: "AvailableRam", description: "Currently free/available RAM in MB", type: "integer", example: 8192),
                new OA\Property(property: "CpuVendor", description: "Processor manufacturer or brand string", type: "string", example: "GenuineIntel"),
                new OA\Property(property: "CpuModel", description: "Specific marketing model of the processor", type: "string", example: "Intel(R) Core(TM) i7-10700K CPU @ 3.80GHz"),
                new OA\Property(property: "CpuSpeed", description: "Processor maximum or current clock speed", type: "string", example: "3.50 GHz"),
                new OA\Property(property: "CpuUtilization", description: "Current CPU utilization percentage", type: "number", format: "float", example: 12.5)
            ]
        )
    )]
    public function info(): JsonResponse
    {
        $os = PHP_OS_FAMILY;

        return response()->json([
            'HOSTOS'         => $this->getDetailedOS($os),
            'TotalRam'       => $this->getTotalRam($os),
            'AvailableRam'   => $this->getAvailableRam($os),
            'CpuVendor'      => $this->getCpuVendor($os),
            'CpuModel'       => $this->getCpuModel($os),
            'CpuSpeed'       => $this->getCpuSpeed($os),
            'CpuUtilization' => $this->getCpuUtilization($os),
        ]);
    }

    private function getDetailedOS(string $os): string
    {
        if ($os === 'Linux' && file_exists('/etc/os-release')) {
            $osInfo = parse_ini_file('/etc/os-release');
            return $osInfo['PRETTY_NAME'] ?? 'Linux';
        }
        if ($os === 'Windows') {
            $output = shell_exec('wmic os get Caption /value');
            if ($output && preg_match('/Caption=(.*)/', $output, $matches)) {
                return trim($matches[1]);
            }
        }
        if ($os === 'Darwin') {
            return 'macOS ' . exec('sw_vers -productVersion');
        }
        return php_uname('s') . ' ' . php_uname('r');
    }

    private function getTotalRam(string $os): int
    {
        if ($os === 'Linux' && is_readable('/proc/meminfo')) {
            $meminfo = file_get_contents('/proc/meminfo');
            if (preg_match('/MemTotal:\s+(\d+)/', $meminfo, $matches)) {
                return (int) round($matches[1] / 1024); // KB to MB
            }
        }
        if ($os === 'Windows') {
            $output = shell_exec('wmic computersystem get TotalPhysicalMemory /value');
            if ($output && preg_match('/TotalPhysicalMemory=(\d+)/', $output, $matches)) {
                return (int) round($matches[1] / 1024 / 1024); // Bytes to MB
            }
        }
        if ($os === 'Darwin') {
            return (int) round(exec('sysctl -n hw.memsize') / 1024 / 1024);
        }
        return 0;
    }

    private function getAvailableRam(string $os): int
    {
        if ($os === 'Linux' && is_readable('/proc/meminfo')) {
            $meminfo = file_get_contents('/proc/meminfo');
            if (preg_match('/MemAvailable:\s+(\d+)/', $meminfo, $matches)) {
                return (int) round($matches[1] / 1024);
            }
        }
        if ($os === 'Windows') {
            $output = shell_exec('wmic os get FreePhysicalMemory /value');
            if ($output && preg_match('/FreePhysicalMemory=(\d+)/', $output, $matches)) {
                return (int) round($matches[1] / 1024); // KB to MB
            }
        }
        if ($os === 'Darwin') {
            $freePages = (int) exec("vm_stat | grep 'Pages free' | awk '{print $3}'");
            return (int) round(($freePages * 4096) / 1024 / 1024); // 4KB page size to MB
        }
        return 0;
    }

    private function getCpuVendor(string $os): string
    {
        if ($os === 'Linux' && is_readable('/proc/cpuinfo')) {
            $cpuinfo = file_get_contents('/proc/cpuinfo');
            if (preg_match('/vendor_id\s+:\s+(.+)/', $cpuinfo, $matches)) {
                return trim($matches[1]);
            }
        }
        if ($os === 'Windows') {
            $output = shell_exec('wmic cpu get Manufacturer /value');
            if ($output && preg_match('/Manufacturer=(.*)/', $output, $matches)) {
                return trim($matches[1]);
            }
        }
        if ($os === 'Darwin') {
            // macOS directly returns vendor info mixed with brand or architectures
            $brand = exec('sysctl -n machdep.cpu.brand_string');
            return str_contains($brand, 'Intel') ? 'GenuineIntel' : 'Apple';
        }
        return 'Unknown';
    }

    private function getCpuModel(string $os): string
    {
        if ($os === 'Linux' && is_readable('/proc/cpuinfo')) {
            $cpuinfo = file_get_contents('/proc/cpuinfo');
            if (preg_match('/model name\s+:\s+(.+)/i', $cpuinfo, $matches)) {
                return trim($matches[1]);
            }
        }
        if ($os === 'Windows') {
            $output = shell_exec('wmic cpu get Name /value');
            if ($output && preg_match('/Name=(.*)/', $output, $matches)) {
                return trim($matches[1]);
            }
        }
        if ($os === 'Darwin') {
            return exec('sysctl -n machdep.cpu.brand_string');
        }
        return 'Unknown';
    }

    private function getCpuSpeed(string $os): string
    {
        if ($os === 'Linux') {
            if (is_readable('/proc/cpuinfo')) {
                $cpuinfo = file_get_contents('/proc/cpuinfo');
                if (preg_match('/cpu MHz\s+:\s+(.+)/', $cpuinfo, $matches)) {
                    return round($matches[1] / 1000, 2) . ' GHz';
                }
            }
            if (file_exists('/sys/devices/system/cpu/cpu0/cpufreq/base_frequency')) {
                $freq = file_get_contents('/sys/devices/system/cpu/cpu0/cpufreq/base_frequency');
                return round($freq / 1000000, 2) . ' GHz';
            }
        }
        if ($os === 'Windows') {
            $output = shell_exec('wmic cpu get MaxClockSpeed /value');
            if ($output && preg_match('/MaxClockSpeed=(\d+)/', $output, $matches)) {
                return round($matches[1] / 1000, 2) . ' GHz';
            }
        }
        if ($os === 'Darwin') {
            $speed = (int) exec('sysctl -n hw.cpufrequency_max');
            return $speed ? round($speed / 1000000000, 2) . ' GHz' : 'N/A';
        }
        return 'Unknown';
    }

    private function getCpuUtilization(string $os): float
    {
        if ($os === 'Linux') {
            $load = sys_getloadavg();
            return isset($load[0]) ? (float) round($load[0] * 100, 2) : 0.0;
        }
        if ($os === 'Windows') {
            $output = shell_exec('wmic cpu get LoadPercentage /value');
            if ($output && preg_match('/LoadPercentage=(\d+)/', $output, $matches)) {
                return (float) $matches[1];
            }
        }
        if ($os === 'Darwin') {
            $output = exec("ps -A -o %cpu | awk '{s+=$1} END {print s}'");
            return (float) round((float)$output, 2);
        }
        return 0.0;
    }
}