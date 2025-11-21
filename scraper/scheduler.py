import asyncio
import subprocess
import os
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

async def run_spiders():
    """Run all configured spiders"""
    while True:
        try:
            logger.info("Starting scheduled spider runs...")

            # List of spiders to run
            spiders = [
                'gtu_syllabus',
                'gtu_circular',
                'gtustudy_real',  # Updated to use the real spider
                'gtumaterial',
            ]

            for spider_name in spiders:
                try:
                    logger.info(f"Running spider: {spider_name}")
                    # The cwd path is adjusted to be relative to the script's location
                    result = subprocess.run(
                        ['scrapy', 'crawl', spider_name],
                        cwd=os.path.join(os.path.dirname(__file__), 'gtu_scraper'),
                        check=True,
                        capture_output=True,
                        text=True
                    )
                    logger.info(f"Spider {spider_name} completed successfully. Output:\n{result.stdout}")

                except subprocess.CalledProcessError as e:
                    logger.error(f"Spider {spider_name} failed with error (return code {e.returncode}):\n{e.stderr}")
                except FileNotFoundError:
                    logger.error(f"Scrapy command not found. Make sure Scrapy is installed and in your PATH.")
                except Exception as e:
                    logger.error(f"An unexpected error occurred while running spider {spider_name}: {e}")

        except Exception as e:
            logger.error(f"An error occurred during the scheduled spider run: {str(e)}")

        # Wait for 24 hours before next run
        await asyncio.sleep(24 * 60 * 60)

if __name__ == "__main__":
    print("Starting GTU Scraper Scheduler...")
    asyncio.run(run_spiders())