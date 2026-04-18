#include <stdio.h>
#include <string.h>
#include <ctype.h>

#define MAX 50

char input[MAX][50];        // Raw input
char productions[MAX][20]; // Split productions
char nonTerminals[MAX];

char first[MAX][MAX], follow[MAX][MAX];

int n, prodCount = 0, ntCount = 0;

// Add symbol to set
void add(char *set, char val) {
    for(int i = 0; set[i]; i++)
        if(set[i] == val) return;

    int len = strlen(set);
    set[len] = val;
    set[len+1] = '\0';
}

// Find index of non-terminal
int findIndex(char c) {
    for(int i = 0; i < ntCount; i++)
        if(nonTerminals[i] == c)
            return i;
    return -1;
}

// Split productions with '|'
void splitProductions() {
    for(int i = 0; i < n; i++) {

        // Validation
        if(!strchr(input[i], '=')) {
            printf("Error: Missing '=' in %s\n", input[i]);
            return;
        }

        if(!isupper(input[i][0])) {
            printf("Error: LHS must be uppercase: %s\n", input[i]);
            return;
        }

        char lhs = input[i][0];

        if(findIndex(lhs) == -1)
            nonTerminals[ntCount++] = lhs;

        char rhs[50];
        strcpy(rhs, strchr(input[i], '=') + 1);

        char *token = strtok(rhs, "|");

        while(token != NULL) {

            if(strlen(token) == 0) {
                printf("Error: Empty RHS in %s\n", input[i]);
                return;
            }

            productions[prodCount][0] = lhs;
            productions[prodCount][1] = '=';
            strcpy(&productions[prodCount][2], token);

            prodCount++;

            token = strtok(NULL, "|");
        }
    }
}

// FIRST
void computeFirst(char c, int idx) {

    if(!isupper(c)) {
        add(first[idx], c);
        return;
    }

    for(int i = 0; i < prodCount; i++) {

        if(productions[i][0] == c) {

            int j = 2;

            if(productions[i][j] == 'e')
                add(first[idx], 'e');

            while(productions[i][j]) {

                if(!isupper(productions[i][j])) {
                    add(first[idx], productions[i][j]);
                    break;
                }
                else {
                    int nextIdx = findIndex(productions[i][j]);

                    computeFirst(productions[i][j], nextIdx);

                    for(int k = 0; first[nextIdx][k]; k++) {
                        if(first[nextIdx][k] != 'e')
                            add(first[idx], first[nextIdx][k]);
                    }

                    if(strchr(first[nextIdx], 'e'))
                        j++;
                    else
                        break;
                }
            }
        }
    }
}

// FOLLOW
void computeFollow(char c, int idx) {

    if(c == productions[0][0])
        add(follow[idx], '$');

    for(int i = 0; i < prodCount; i++) {

        for(int j = 2; productions[i][j]; j++) {

            if(productions[i][j] == c) {

                if(productions[i][j+1]) {

                    char next = productions[i][j+1];

                    if(!isupper(next)) {
                        add(follow[idx], next);
                    }
                    else {
                        int nextIdx = findIndex(next);

                        for(int k = 0; first[nextIdx][k]; k++) {
                            if(first[nextIdx][k] != 'e')
                                add(follow[idx], first[nextIdx][k]);
                        }

                        if(strchr(first[nextIdx], 'e')) {
                            int lhsIdx = findIndex(productions[i][0]);

                            if(productions[i][0] != c){
                                computeFollow(productions[i][0], lhsIdx);
                                for(int k = 0; follow[lhsIdx][k]; k++)
                                    add(follow[idx], follow[lhsIdx][k]);
                            }
                        }
                    }
                }
                else {
                    int lhsIdx = findIndex(productions[i][0]);

                    if(productions[i][0] != c){
                        computeFollow(productions[i][0], lhsIdx);
                        for(int k = 0; follow[lhsIdx][k]; k++)
                          add(follow[idx], follow[lhsIdx][k]);  
                    }
                }
            }
        }
    }
}

int main() {

    printf("Enter number of productions: ");
    scanf("%d", &n);

    if(n <= 0 || n > MAX) {
        printf("Error: Invalid number of productions\n");
        return 0;
    }

    printf("Enter productions (Example: E=aB|e):\n");

    for(int i = 0; i < n; i++)
        scanf("%s", input[i]);

    // Split into multiple productions
    splitProductions();

    // Initialize sets
    for(int i = 0; i < ntCount; i++) {
        first[i][0] = '\0';
        follow[i][0] = '\0';
    }

    // Compute FIRST
    for(int i = 0; i < ntCount; i++)
        computeFirst(nonTerminals[i], i);

    // Compute FOLLOW
    for(int i = 0; i < ntCount; i++)
        computeFollow(nonTerminals[i], i);

    // Print FIRST
    printf("\nFIRST Sets:\n");
    for(int i = 0; i < ntCount; i++) {
        printf("FIRST(%c) = { ", nonTerminals[i]);
        for(int j = 0; first[i][j]; j++)
            printf("%c ", first[i][j]);
        printf("}\n");
    }

    // Print FOLLOW
    printf("\nFOLLOW Sets:\n");
    for(int i = 0; i < ntCount; i++) {
        printf("FOLLOW(%c) = { ", nonTerminals[i]);
        for(int j = 0; follow[i][j]; j++)
            printf("%c ", follow[i][j]);
        printf("}\n");
    }

    return 0;
}