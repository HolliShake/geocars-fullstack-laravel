import os
import argparse

TEMPLATE_IREPO = """\
<?php

namespace App\Interface\Repository;

use Illuminate\Database\Eloquent\Model;

interface I{{ class }}Repo extends IGenericRepo
{
    #
}
"""

TEMPLATE_REPO = """\
<?php

namespace App\Repository;

use App\Interface\Repository\I{{ class }}Repo;
use App\Models\{{ class }};
use App\Repository\GenericRepo;

class {{ class }}Repo extends GenericRepo implements I{{ class }}Repo
{
    public function __construct()
    {
        parent::__construct({{ class }}::class);
    }
}
"""

TEMPLATE_ISERVICE = """\
<?php

namespace App\Interface\Service;

use App\Interface\Service\IGenericService;

interface I{{ class }}Service extends IGenericService
{
}
"""

TEMPLATE_SERVICE = """\
<?php

namespace App\Service;

use App\Interface\Repository\I{{ class }}Repo;
use App\Interface\Service\I{{ class }}Service;
use App\Service\GenericService;

class {{ class }}Service extends GenericService implements I{{ class }}Service
{
    public function __construct(I{{ class }}Repo $repo)
    {
        parent::__construct($repo);
    }
}
"""


IREPO_PATH = './app/Interface/Repository'
REPO_PATH = './app/Repository'
ISERVICE_PATH = './app/Interface/Service'
SERVICE_PATH = './app/Service'

def generate_files(class_name):
    """Generate all the files for a given model class."""

    # Ensure directories exist
    os.makedirs(IREPO_PATH, exist_ok=True)
    os.makedirs(REPO_PATH, exist_ok=True)
    os.makedirs(ISERVICE_PATH, exist_ok=True)
    os.makedirs(SERVICE_PATH, exist_ok=True)

    files_to_generate = [
        (f"{IREPO_PATH}/I{class_name}Repo.php", TEMPLATE_IREPO),
        (f"{REPO_PATH}/{class_name}Repo.php", TEMPLATE_REPO),
        (f"{ISERVICE_PATH}/I{class_name}Service.php", TEMPLATE_ISERVICE),
        (f"{SERVICE_PATH}/{class_name}Service.php", TEMPLATE_SERVICE),
    ]

    for file_path, template in files_to_generate:
        if os.path.exists(file_path):
            print(f"File {file_path} already exists, skipping...")
            continue

        content = template.replace("{{ class }}", class_name)

        with open(file_path, 'w') as f:
            f.write(content)

        print(f"Generated: {file_path}")

def main():
    parser = argparse.ArgumentParser(description='Generate Laravel repository and service files')
    parser.add_argument('--model', required=True, help='Model class name to generate files for')

    args = parser.parse_args()

    generate_files(args.model)

if __name__ == "__main__":
    main()
