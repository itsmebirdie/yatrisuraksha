
import subprocess
import sys

def get_collaborator_emails():
    """Retrieves a list of all unique author emails from the Git log."""
    try:
        # Fetch all author emails from git log
        result = subprocess.run(
            ['git', 'log', '--format=%ae'],
            capture_output=True, 
            text=True, 
            check=True
        )
        
        # Split output into lines, remove empty lines, and get unique values
        emails = set(filter(None, result.stdout.split('\n')))
        return sorted(list(emails))
        
    except subprocess.CalledProcessError as e:
        print(f"Error retrieving Git log. Are you in a Git repository?\nDetails: {e.stderr}")
        sys.exit(1)

def remove_commits_by_email(email):
    """Rewrites Git history to remove all commits by the specified email."""
    print(f"\n⚠️  WARNING: You are about to permanently rewrite Git history.")
    print(f"This will remove ALL commits authored by: {email}")
    
    confirm = input("Are you absolutely sure you want to proceed? (Type 'yes' to confirm): ")
    if confirm.lower() != 'yes':
        print("Operation aborted.")
        return

    # Shell script logic passed to git filter-branch
    commit_filter = f'''
    if [ "$GIT_AUTHOR_EMAIL" = "{email}" ]; then
        skip_commit "$@";
    else
        git commit-tree "$@";
    fi
    '''
    
    command = [
        'git', 
        'filter-branch', 
        '-f', 
        '--commit-filter', 
        commit_filter, 
        'HEAD'
    ]
    
    print("\nRewriting history... This may take a moment depending on the repository size.")
    try:
        # Run the git filter-branch command
        subprocess.run(command, check=True)
        print(f"\n✅ Successfully removed all commits authored by {email}.")
        print("Note: If this project is pushed to a remote repository (like GitHub),")
        print("you will need to run 'git push origin <branch-name> --force' to apply the changes.")
        
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Error during history rewrite: {e}")

if __name__ == "__main__":
    print("Fetching collaborator emails...\n")
    emails = get_collaborator_emails()
    
    if not emails:
        print("No commits found in this repository.")
        sys.exit(0)
        
    print("Collaborators found in history:")
    for i, email in enumerate(emails, 1):
        print(f"[{i}] {email}")
        
    try:
        choice = input("\nEnter the number of the collaborator to remove (or 'q' to quit): ")
        
        if choice.lower() == 'q':
            print("Exiting.")
            sys.exit(0)
            
        choice_idx = int(choice)
        if 1 <= choice_idx <= len(emails):
            target_email = emails[choice_idx - 1]
            remove_commits_by_email(target_email)
        else:
            print("Invalid selection. Number out of range.")
            
    except ValueError:
        print("Invalid input. Please enter a valid number.")